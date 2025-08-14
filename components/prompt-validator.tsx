"use client"

import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Info, Lightbulb } from "lucide-react"

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  variables: DetectedVariable[]
}

export interface ValidationError {
  type: "syntax" | "variable" | "length" | "required"
  message: string
  position?: { start: number; end: number }
}

export interface ValidationWarning {
  type: "variable" | "length" | "format"
  message: string
  position?: { start: number; end: number }
}

export interface ValidationSuggestion {
  type: "variable" | "improvement" | "template"
  message: string
  action?: string
}

export interface DetectedVariable {
  name: string
  position: { start: number; end: number }
  isValid: boolean
  suggestion?: string
}

// Variables disponibles en el sistema
const AVAILABLE_VARIABLES = [
  "NOMBRE",
  "APELLIDO",
  "EMPRESA",
  "PRODUCTO",
  "PLAN",
  "PRECIO",
  "BENEFICIO_1",
  "BENEFICIO_2",
  "BENEFICIO_3",
  "FECHA",
  "TELEFONO",
  "EMAIL",
  "CIUDAD",
  "PAIS",
  "ROI",
  "DESCUENTO",
  "TIEMPO_PRUEBA",
]

export class PromptValidator {
  static validate(prompt: string, title = "", description = ""): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: ValidationSuggestion[] = []
    const variables = this.detectVariables(prompt)

    // Validación de campos requeridos
    if (!title.trim()) {
      errors.push({
        type: "required",
        message: "El título es obligatorio",
      })
    }

    if (!prompt.trim()) {
      errors.push({
        type: "required",
        message: "El contenido del prompt es obligatorio",
      })
      return { isValid: false, errors, warnings, suggestions, variables }
    }

    // Validación de longitud
    if (prompt.length < 10) {
      errors.push({
        type: "length",
        message: "El prompt debe tener al menos 10 caracteres",
      })
    }

    if (prompt.length > 2000) {
      warnings.push({
        type: "length",
        message: "El prompt es muy largo (más de 2000 caracteres). Considera dividirlo.",
      })
    }

    if (title.length > 100) {
      warnings.push({
        type: "length",
        message: "El título es muy largo (más de 100 caracteres)",
      })
    }

    // Validación de variables
    variables.forEach((variable) => {
      if (!variable.isValid) {
        errors.push({
          type: "variable",
          message: `Variable mal formateada: [${variable.name}]`,
          position: variable.position,
        })
      }
    })

    // Detectar variables no reconocidas
    const unrecognizedVars = variables.filter((v) => v.isValid && !AVAILABLE_VARIABLES.includes(v.name))

    unrecognizedVars.forEach((variable) => {
      const suggestion = this.findSimilarVariable(variable.name)
      warnings.push({
        type: "variable",
        message: `Variable no reconocida: [${variable.name}]${suggestion ? `. ¿Quisiste decir [${suggestion}]?` : ""}`,
        position: variable.position,
      })
    })

    // Sugerencias de mejora
    if (variables.length === 0) {
      suggestions.push({
        type: "variable",
        message: "Considera usar variables como [NOMBRE] o [EMPRESA] para personalizar el mensaje",
      })
    }

    if (!prompt.includes("?") && !prompt.includes("¿")) {
      suggestions.push({
        type: "improvement",
        message: "Considera agregar una pregunta para fomentar la interacción",
      })
    }

    if (prompt.split(".").length < 2) {
      suggestions.push({
        type: "improvement",
        message: "El prompt podría beneficiarse de más estructura con múltiples oraciones",
      })
    }

    // Validación de sintaxis básica
    const unclosedBrackets = this.findUnclosedBrackets(prompt)
    unclosedBrackets.forEach((position) => {
      errors.push({
        type: "syntax",
        message: "Corchete sin cerrar detectado",
        position,
      })
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      variables,
    }
  }

  private static detectVariables(text: string): DetectedVariable[] {
    const variableRegex = /\[([^\]]*)\]/g
    const variables: DetectedVariable[] = []
    let match

    while ((match = variableRegex.exec(text)) !== null) {
      const variableName = match[1]
      const isValid = this.isValidVariableName(variableName)

      variables.push({
        name: variableName,
        position: { start: match.index, end: match.index + match[0].length },
        isValid,
        suggestion: !isValid ? this.findSimilarVariable(variableName) : undefined,
      })
    }

    return variables
  }

  private static isValidVariableName(name: string): boolean {
    // Variable válida: solo letras, números y guiones bajos
    return /^[A-Z0-9_]+$/.test(name) && name.length > 0
  }

  private static findSimilarVariable(input: string): string | undefined {
    const inputUpper = input.toUpperCase()

    // Buscar coincidencia exacta primero
    if (AVAILABLE_VARIABLES.includes(inputUpper)) {
      return inputUpper
    }

    // Buscar coincidencias parciales
    const partialMatches = AVAILABLE_VARIABLES.filter(
      (variable) => variable.includes(inputUpper) || inputUpper.includes(variable),
    )

    if (partialMatches.length > 0) {
      return partialMatches[0]
    }

    // Buscar por similitud (algoritmo simple)
    let bestMatch = ""
    let bestScore = 0

    AVAILABLE_VARIABLES.forEach((variable) => {
      const score = this.calculateSimilarity(inputUpper, variable)
      if (score > bestScore && score > 0.5) {
        bestScore = score
        bestMatch = variable
      }
    })

    return bestMatch || undefined
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1.0

    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  private static findUnclosedBrackets(text: string): { start: number; end: number }[] {
    const unclosed: { start: number; end: number }[] = []
    const openBrackets: number[] = []

    for (let i = 0; i < text.length; i++) {
      if (text[i] === "[") {
        openBrackets.push(i)
      } else if (text[i] === "]") {
        if (openBrackets.length > 0) {
          openBrackets.pop()
        }
      }
    }

    // Los corchetes que quedaron abiertos
    openBrackets.forEach((start) => {
      unclosed.push({ start, end: start + 1 })
    })

    return unclosed
  }

  static getAvailableVariables(): string[] {
    return [...AVAILABLE_VARIABLES]
  }
}

interface ValidationDisplayProps {
  validation: ValidationResult
  className?: string
}

export function ValidationDisplay({ validation, className = "" }: ValidationDisplayProps) {
  if (!validation.errors.length && !validation.warnings.length && !validation.suggestions.length) {
    return (
      <div className={`flex items-center gap-2 text-green-600 ${className}`}>
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Prompt válido</span>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Errores */}
      {validation.errors.map((error, index) => (
        <div key={`error-${index}`} className="flex items-start gap-2 text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error.message}</span>
        </div>
      ))}

      {/* Advertencias */}
      {validation.warnings.map((warning, index) => (
        <div key={`warning-${index}`} className="flex items-start gap-2 text-yellow-600">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{warning.message}</span>
        </div>
      ))}

      {/* Sugerencias */}
      {validation.suggestions.map((suggestion, index) => (
        <div key={`suggestion-${index}`} className="flex items-start gap-2 text-blue-600">
          <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{suggestion.message}</span>
        </div>
      ))}

      {/* Variables detectadas */}
      {validation.variables.length > 0 && (
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Variables detectadas:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {validation.variables.map((variable, index) => (
              <Badge key={index} variant={variable.isValid ? "secondary" : "destructive"} className="text-xs">
                [{variable.name}]
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
