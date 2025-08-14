"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ValidationDisplay, PromptValidator, type ValidationResult } from "./prompt-validator"
import { VariableHelper } from "./variable-helper"
import { X, Save, Eye, AlertTriangle } from "lucide-react"

interface PromptModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit" | "view"
  prompt?: {
    title: string
    description: string
    prompt: string
    category: string
    usage: number
    active: boolean
  }
  onSave?: (promptData: any) => void
}

export function PromptModal({ isOpen, onClose, mode, prompt, onSave }: PromptModalProps) {
  const [formData, setFormData] = useState({
    title: prompt?.title || "",
    description: prompt?.description || "",
    prompt: prompt?.prompt || "",
    category: prompt?.category || "Saludo",
  })

  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    variables: [],
  })

  const [showVariableHelper, setShowVariableHelper] = useState(false)

  const categories = [
    "Saludo",
    "Calificación",
    "Presentación",
    "Objeciones",
    "Cierre",
    "Seguimiento",
    "Recuperación",
    "Upselling",
    "Renovación",
  ]

  useEffect(() => {
    if (mode !== "view") {
      const result = PromptValidator.validate(formData.prompt, formData.title, formData.description)
      setValidation(result)
    }
  }, [formData, mode])

  useEffect(() => {
    if (prompt) {
      setFormData({
        title: prompt.title,
        description: prompt.description,
        prompt: prompt.prompt,
        category: prompt.category,
      })
    } else {
      // si se abre en modo crear, limpiamos
      setFormData({
        title: "",
        description: "",
        prompt: "",
        category: "Saludo",
      })
    }
  }, [prompt, isOpen])

  const handleSave = () => {
    if (validation.isValid && onSave) onSave(formData)
    onClose()
  }

  const handleInsertVariable = (variable: string) => {
    const textarea = document.getElementById("prompt-textarea") as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.prompt
    const before = text.substring(0, start)
    const after = text.substring(end)
    const newText = before + `[${variable}]` + after
    setFormData({ ...formData, prompt: newText })
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length + 2, start + variable.length + 2)
    }, 0)
  }

  const isViewMode = mode === "view"
  const isCreateMode = mode === "create"

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Contenedor principal del modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Card como layout vertical */}
        <Card className="border-0 shadow-none h-full flex flex-col">
          {/* Header */}
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isViewMode && <Eye className="w-5 h-5 text-blue-600" />}
                {!isViewMode && !validation.isValid && <AlertTriangle className="w-5 h-5 text-red-600" />}
                <CardTitle>
                  {isCreateMode && "Crear Nuevo Prompt"}
                  {mode === "edit" && "Editar Prompt"}
                  {isViewMode && "Vista Completa del Prompt"}
                </CardTitle>
                {isViewMode && prompt?.active && <Badge className="bg-green-600 text-white">Activo</Badge>}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Contenido scrollable */}
          <CardContent className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Título */}
              <div>
                <Label htmlFor="title">Título del Prompt</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Saludo Inicial"
                  disabled={isViewMode}
                  className="mt-1"
                />
              </div>

              {/* Descripción 
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descripción del propósito del prompt"
                  disabled={isViewMode}
                  className="mt-1"
                />
              </div> */}

              {/* Categoría
              <div>
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  disabled={isViewMode}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>  */}

              {/* Prompt Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="prompt-textarea">Contenido del Prompt</Label>
                  {!isViewMode && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowVariableHelper(!showVariableHelper)}
                    >
                      {showVariableHelper ? "Ocultar" : "Mostrar"} Variables
                    </Button>
                  )}
                </div>
                <textarea
                  id="prompt-textarea"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="Escribe aquí el contenido completo del prompt..."
                  disabled={isViewMode}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none disabled:bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Caracteres: {formData.prompt.length} | Variables detectadas: {validation.variables.length}
                </p>
              </div>

              {/* Validación 
              {!isViewMode && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-3">Validación del Prompt</h4>
                  <ValidationDisplay validation={validation} />
                </div>
              )}*/}

              {/* Estadísticas en modo vista */}
              {isViewMode && prompt && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Categoría</p>
                    <Badge className="mt-1 bg-purple-100 text-purple-800">{prompt.category}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Usos</p>
                    <p className="font-semibold">{prompt.usage.toLocaleString()} veces</p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel lateral de variables */}
            {!isViewMode && showVariableHelper && (
              <div className="mt-6 border rounded-lg">
                <VariableHelper onInsertVariable={handleInsertVariable} className="border-0 bg-transparent" />
              </div>
            )}
          </CardContent>

          {/* Footer STICKY siempre visible */}
          <div className="sticky bottom-0 w-full bg-white border-t px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isViewMode && !validation.isValid && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Corrige los errores antes de guardar</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                {isViewMode ? "Cerrar" : "Cancelar"}
              </Button>
              {!isViewMode && (
                <Button onClick={handleSave} disabled={!validation.isValid || !formData.title || !formData.prompt}>
                  <Save className="w-4 h-4 mr-2" />
                  {isCreateMode ? "Crear Prompt" : "Guardar Cambios"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
