import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign } from 'lucide-react'

const salesData = [
  { name: "María García", plan: "Plan Premium", amount: "$299", time: "Hace 2h" },
  { name: "Carlos López", plan: "Plan Básico", amount: "$99", time: "Hace 3h" },
  { name: "Ana Rodríguez", plan: "Plan Pro", amount: "$199", time: "Hace 5h" },
  { name: "José Martín", plan: "Plan Premium", amount: "$299", time: "Hace 6h" },
]

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-green-600" />
          </div>
          Ventas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {salesData.map((sale, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{sale.name}</p>
                <p className="text-sm text-gray-500">{sale.plan}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">{sale.amount}</p>
                <p className="text-sm text-gray-500">{sale.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
