import { Home, ShoppingCart, Users, Package, Bot, Menu, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    //{ icon: Home, label: "Dashboard", page: "dashboard" },
   // { icon: ShoppingCart, label: "Ventas", page: "ventas" },
    //{ icon: Users, label: "Clientes", page: "clientes" },
    //{ icon: Package, label: "Productos", page: "productos" },
    { icon: Bot, label: "Agente IA", page: "agente-ia" },
    { icon: Settings, label: "Configuración", page: "configuracion" },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">AI Sales Pro</span>
          <Button variant="ghost" size="sm" className="ml-auto">
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Button
                variant={currentPage === item.page ? "default" : "ghost"}
                className={`w-full justify-start ${
                  currentPage === item.page
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => onNavigate(item.page)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
