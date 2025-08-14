import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  iconBg: string
}

export function MetricCard({ title, value, change, icon, iconBg }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              {change}
            </div>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
