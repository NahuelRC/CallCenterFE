"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Plus, MessageCircle, Phone, AlertTriangle } from "lucide-react";

import {
  listContacts,
  upsertContact,
  setAgentEnabledByPhone,
  type Contact,
} from "@/lib/contactsApi";

type Filtro = "Todos" | "Activos" | "Prospectos" | "Clientes" | "Bloqueados" | "Test";

export function ClientesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<Filtro>("Todos");

  // Cargar contactos del BE
  const refresh = async () => {
    try {
      setLoading(true);
      const rows = await listContacts();
      setContacts(rows || []);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Error cargando contactos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const total = contacts.length;
  const activeCount = contacts.filter((c) => (c.status ?? "active") === "active").length;
  const prospectCount = contacts.filter((c) => c.status === "prospect").length;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
      case "blocked":
        return <Badge className="bg-gray-100 text-gray-800">Bloqueado</Badge>;
      case "prospect":
        return <Badge className="bg-yellow-100 text-yellow-800">Prospecto</Badge>;
      case "customer":
        return <Badge className="bg-purple-100 text-purple-800">Cliente</Badge>;
      case "test":
        return <Badge className="bg-blue-100 text-blue-800">Test</Badge>;
      default:
        return <Badge variant="secondary">{status || "Activo"}</Badge>;
    }
  };

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return contacts.filter((c) => {
      const matchesSearch =
        !term ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(term));

      const st = (c.status ?? "active").toLowerCase();
      const matchesFilter =
        selectedFilter === "Todos" ||
        (selectedFilter === "Activos" && st === "active") ||
        (selectedFilter === "Prospectos" && st === "prospect") ||
        (selectedFilter === "Clientes" && st === "customer") ||
        (selectedFilter === "Bloqueados" && st === "blocked") ||
        (selectedFilter === "Test" && st === "test");

      return matchesSearch && matchesFilter;
    });
  }, [contacts, searchTerm, selectedFilter]);

  const handleAddClient = async () => {
    const phone = window.prompt("Ingresá el teléfono en formato E.164 (ej: +549341XXXXXXX):")?.trim();
    if (!phone) return;

    const name = window.prompt("Nombre (opcional):")?.trim() || undefined;

    try {
      await upsertContact({ phone, name });
      await refresh();
      alert("Cliente guardado ✅");
    } catch (e: any) {
      alert(e.message || "No se pudo crear/actualizar el cliente");
    }
  };

  const handleToggleAgent = async (phone: string, status?: string) => {
    const isBlocked = status === "blocked";
    try {
      await setAgentEnabledByPhone(phone, isBlocked); // si está bloqueado -> activar, si no -> desactivar
      await refresh();
    } catch (e: any) {
      alert(e.message || "No se pudo actualizar el estado del agente");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-600">Cargando clientes…</div>;
  }
  if (error) {
    return (
      <div className="p-8 text-red-600 flex items-center gap-2">
        <AlertTriangle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-600 mt-2">Gestiona tu base de clientes y sus interacciones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prospectos</p>
                <p className="text-2xl font-bold text-yellow-600">{prospectCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o tag…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as Filtro)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Todos">Todos</option>
                <option value="Activos">Activos</option>
                <option value="Prospectos">Prospectos</option>
                <option value="Clientes">Clientes</option>
                <option value="Bloqueados">Bloqueados</option>
                <option value="Test">Test</option>
              </select>
            </div>
            <Button onClick={handleAddClient}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((c) => {
              const initials =
                (c.name?.trim() || c.phone || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "?";

              const isBlocked = c.status === "blocked";

              return (
                <div
                  key={c._id || c.phone}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Col 1: Identidad */}
                    <div className="lg:col-span-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {c.name || "Sin nombre"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {c.phone}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Col 2: Estado */}
                    <div className="lg:col-span-3">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-900">Estado</div>
                        {getStatusBadge(c.status)}
                      </div>
                    </div>

                    {/* Col 3: Tags (si tenés) */}
                    <div className="lg:col-span-2">
                      <div className="text-sm text-gray-600">
                        {(c.tags && c.tags.length > 0) ? (
                          <div className="flex flex-wrap gap-1">
                            {c.tags.map((t) => (
                              <Badge key={t} variant="secondary">{t}</Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin tags</span>
                        )}
                      </div>
                    </div>

                    {/* Col 4: Acciones */}
                    <div className="lg:col-span-2">
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => alert(`Abrir conversación con ${c.phone}`)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Conversación
                        </Button>

                        <Button
                          size="sm"
                          className="w-full"
                          variant={isBlocked ? "default" : "destructive"}
                          onClick={() => handleToggleAgent(c.phone, c.status)}
                        >
                          {isBlocked ? "Activar Agente" : "Desactivar Agente"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h3>
              <p className="text-gray-600">Intenta ajustar los filtros o la búsqueda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
