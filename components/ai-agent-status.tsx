import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot } from 'lucide-react'

export function AIAgentStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-purple-600" />
          </div>
          Estado del Agente IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Estado</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">Activo</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Conversaciones hoy</span>
            <span className="font-semibold">47</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tasa de conversión</span>
            <span className="font-semibold text-green-600">78.5%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tiempo promedio</span>
            <span className="font-semibold">4.2 min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
