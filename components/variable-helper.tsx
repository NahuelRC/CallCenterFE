"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

interface VariableHelperProps {
  onInsertVariable: (variable: string) => void
  className?: string
}

const VARIABLE_CATEGORIES = {
  Cliente: ["NOMBRE", "APELLIDO", "EMPRESA", "EMAIL", "TELEFONO", "CIUDAD", "PAIS"],
  Producto: ["PRODUCTO", "PLAN", "PRECIO", "BENEFICIO_1", "BENEFICIO_2", "BENEFICIO_3"],
  Ventas: ["ROI", "DESCUENTO", "TIEMPO_PRUEBA"],
  Sistema: ["FECHA"],
}

const VARIABLE_DESCRIPTIONS: Record<string, string> = {
  NOMBRE: "Nombre del cliente",
  APELLIDO: "Apellido del cliente",
  EMPRESA: "Nombre de la empresa del cliente",
  EMAIL: "Correo electrónico del cliente",
  TELEFONO: "Número de teléfono del cliente",
  CIUDAD: "Ciudad del cliente",
  PAIS: "País del cliente",
  PRODUCTO: "Nombre del producto o servicio",
  PLAN: "Tipo de plan (Básico, Pro, Premium)",
  PRECIO: "Precio del producto o plan",
  BENEFICIO_1: "Primer beneficio principal",
  BENEFICIO_2: "Segundo beneficio principal",
  BENEFICIO_3: "Tercer beneficio principal",
  ROI: "Retorno de inversión esperado",
  DESCUENTO: "Porcentaje o monto de descuento",
  TIEMPO_PRUEBA: "Duración del período de prueba",
  FECHA: "Fecha actual o específica",
}

export function VariableHelper({ onInsertVariable, className = "" }: VariableHelperProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="w-4 h-4" />
          Variables Disponibles
        </CardTitle>
        <p className="text-sm text-gray-600">Haz clic en una variable para insertarla en tu prompt</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(VARIABLE_CATEGORIES).map(([category, variables]) => (
          <div key={category}>
            <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
            <div className="grid grid-cols-1 gap-1">
              {variables.map((variable) => (
                <Button
                  key={variable}
                  variant="ghost"
                  size="sm"
                  className="justify-start h-auto p-2 text-left"
                  onClick={() => onInsertVariable(variable)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Badge variant="outline" className="text-xs font-mono">
                      [{variable}]
                    </Badge>
                    <span className="text-xs text-gray-600 truncate">{VARIABLE_DESCRIPTIONS[variable]}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-3 border-t">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h5 className="font-medium text-sm text-blue-900 mb-1">💡 Consejos</h5>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Las variables deben estar en MAYÚSCULAS</li>
              <li>• Usa guiones bajos para separar palabras</li>
              <li>• Ejemplo: [NOMBRE], [BENEFICIO_1]</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
