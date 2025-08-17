"use client"

import { useState } from "react"
import { Sidebar } from "./components/sidebar"
import { MetricCard } from "./components/metric-card"
import { RecentSales } from "./components/recent-sales"
import { AIAgentStatus } from "./components/ai-agent-status"
import { AgenteIAPage } from "./components/agente-ia-page"
import { ConfiguracionPage } from "./components/configuracion-page"
import { ClientesPage } from "./components/clientes-page"
import { ConversacionesPage } from "./components/conversaciones-page"
import { DollarSign, Users, Package, Target } from "lucide-react"

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "agente-ia":
        return <AgenteIAPage />
      case "configuracion":
        return <ConfiguracionPage />
      case "conversaciones":
        return <ConversacionesPage />
      case "clientes":
        return <ClientesPage />
      case "dashboard":
      default:
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Resumen general de tu agente de ventas con IA</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Ventas Totales"
                value="$45,231"
                change="+20.1% desde el mes pasado"
                icon={<DollarSign className="w-6 h-6 text-white" />}
                iconBg="bg-green-500"
              />
              <MetricCard
                title="Clientes Activos"
                value="2,350"
                change="+15.3% desde el mes pasado"
                icon={<Users className="w-6 h-6 text-white" />}
                iconBg="bg-blue-500"
              />
              <MetricCard
                title="Productos"
                value="1,245"
                change="+5.2% desde el mes pasado"
                icon={<Package className="w-6 h-6 text-white" />}
                iconBg="bg-purple-500"
              />
              <MetricCard
                title="Conversión IA"
                value="78.5%"
                change="+12.5% desde el mes pasado"
                icon={<Target className="w-6 h-6 text-white" />}
                iconBg="bg-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentSales />
              <AIAgentStatus />
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <div className="flex-1 overflow-auto">{renderPage()}</div>
    </div>
  )
}
