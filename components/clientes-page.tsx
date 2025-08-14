"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Search, Plus, MessageCircle, ShoppingCart, Phone, Mail, TrendingUp } from "lucide-react"
import { useState } from "react"

const clientes = [
  {
    id: 1,
    nombre: "María García",
    empresa: "TechStart Solutions",
    email: "maria@techstart.com",
    telefono: "+52 55 1234 5678",
    plan: "Plan Premium",
    estado: "Activo",
    ultimaConversacion: "Hace 2 horas",
    ventasTotal: "$2,850",
    conversaciones: 12,
    fechaRegistro: "15 Mar 2024",
  },
  {
    id: 2,
    nombre: "Carlos López",
    empresa: "Innovate Corp",
    email: "carlos@innovate.com",
    telefono: "+52 55 2345 6789",
    plan: "Plan Básico",
    estado: "Activo",
    ultimaConversacion: "Hace 1 día",
    ventasTotal: "$450",
    conversaciones: 8,
    fechaRegistro: "12 Mar 2024",
  },
  {
    id: 3,
    nombre: "Ana Rodríguez",
    empresa: "Digital Marketing Pro",
    email: "ana@digitalmp.com",
    telefono: "+52 55 3456 7890",
    plan: "Plan Pro",
    estado: "Prospecto",
    ultimaConversacion: "Hace 3 horas",
    ventasTotal: "$1,200",
    conversaciones: 15,
    fechaRegistro: "10 Mar 2024",
  },
  {
    id: 4,
    nombre: "José Martín",
    empresa: "E-commerce Plus",
    email: "jose@ecommerceplus.com",
    telefono: "+52 55 4567 8901",
    plan: "Plan Premium",
    estado: "Inactivo",
    ultimaConversacion: "Hace 1 semana",
    ventasTotal: "$3,200",
    conversaciones: 25,
    fechaRegistro: "08 Mar 2024",
  },
  {
    id: 5,
    nombre: "Laura Sánchez",
    empresa: "Creative Agency",
    email: "laura@creative.com",
    telefono: "+52 55 5678 9012",
    plan: "Plan Pro",
    estado: "Activo",
    ultimaConversacion: "Hace 30 min",
    ventasTotal: "$1,800",
    conversaciones: 18,
    fechaRegistro: "05 Mar 2024",
  },
  {
    id: 6,
    nombre: "Roberto Chen",
    empresa: "Tech Consulting",
    email: "roberto@techconsult.com",
    telefono: "+52 55 6789 0123",
    plan: "Plan Básico",
    estado: "Prospecto",
    ultimaConversacion: "Hace 2 días",
    ventasTotal: "$650",
    conversaciones: 6,
    fechaRegistro: "03 Mar 2024",
  },
]

export function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("Todos")

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Activo":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>
      case "Prospecto":
        return <Badge className="bg-yellow-100 text-yellow-800">Prospecto</Badge>
      case "Inactivo":
        return <Badge className="bg-gray-100 text-gray-800">Inactivo</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch =
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = selectedFilter === "Todos" || cliente.estado === selectedFilter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-600 mt-2">Gestiona tu base de clientes y sus interacciones</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">2,350</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Clientes Activos</p>
                <p className="text-2xl font-bold text-green-600">1,847</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prospectos</p>
                <p className="text-2xl font-bold text-yellow-600">425</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ventas del Mes</p>
                <p className="text-2xl font-bold text-purple-600">$45,231</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Todos">Todos los estados</option>
                <option value="Activo">Activos</option>
                <option value="Prospecto">Prospectos</option>
                <option value="Inactivo">Inactivos</option>
              </select>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({filteredClientes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredClientes.map((cliente) => (
              <div key={cliente.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  {/* Client Info */}
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {cliente.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{cliente.nombre}</h3>
                        <p className="text-sm text-gray-600">{cliente.empresa}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="lg:col-span-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {cliente.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {cliente.telefono}
                      </div>
                    </div>
                  </div>

                  {/* Plan and Status */}
                  <div className="lg:col-span-2">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-900">{cliente.plan}</div>
                      {getEstadoBadge(cliente.estado)}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="lg:col-span-2">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-green-600">{cliente.ventasTotal}</span> en ventas
                      </div>
                      <div className="text-sm text-gray-600">{cliente.conversaciones} conversaciones</div>
                      <div className="text-sm text-gray-500">{cliente.ultimaConversacion}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1">
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="outline" className="w-full bg-transparent">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Conversación
                      </Button>
                      <Button size="sm" className="w-full">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Agregar Venta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClientes.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h3>
              <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
