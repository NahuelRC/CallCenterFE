"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  listConversations,
  activateAgentByPhone,
  deactivateAgentByPhone,
  type ConversationRow,
} from "@/lib/messagesApi";
import { ConversationModal } from "./conversation-modal"; // ojo con el nombre del archivo que pasaste
import {
  Users,
  Search,
  MessageCircle,
  Power,
  PowerOff,
  AlertTriangle,
  Clock3,
} from "lucide-react";

type Filtro = "Todos" | "Activos" | "Bloqueados";

function timeAgo(iso: string) {
  const d = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - d);

  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Justo ahora";
  if (mins < 60) return `Hace ${mins} min`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} d`;

  const weeks = Math.floor(days / 7);
  return `Hace ${weeks} sem`;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active")
    return <Badge className="bg-green-100 text-green-800">Activo</Badge>;
  if (status === "blocked")
    return <Badge className="bg-gray-200 text-gray-800">Bloqueado</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

export function ConversacionesPage() {
  const [rows, setRows] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  // cargar conversaciones
  const fetchRows = async () => {
    try {
      setLoading(true);
      const data = await listConversations({
        search: search.trim() || undefined,
        limit: 100,
        offset: 0,
      });
      setRows(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Error cargando conversaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // carga inicial

  // aplicar filtro por estado en el cliente (el BE ya filtra por search)
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filtro === "Activos") return r.status === "active";
      if (filtro === "Bloqueados") return r.status === "blocked";
      return true;
    });
  }, [rows, filtro]);

  const total = rows.length;
  const activos = rows.filter((r) => r.status === "active").length;

  const handleOpenConversation = (phone: string) => {
    setSelectedPhone(phone);
    setModalOpen(true);
  };

  const handleToggleAgent = async (row: ConversationRow) => {
    try {
      if (row.status === "blocked") {
        await activateAgentByPhone(row.phone);
      } else {
        await deactivateAgentByPhone(row.phone);
      }
      await fetchRows();
    } catch (e: any) {
      alert(e.message || "No se pudo actualizar el estado del agente");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Conversaciones</h1>
        <p className="text-gray-600 mt-2">
          Vista agregada por número: actividad reciente, cantidad de mensajes y estado del agente.
        </p>
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
                <p className="text-sm text-gray-600">Conversaciones</p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Power className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Agente Activo</p>
                <p className="text-2xl font-bold text-green-600">{activos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Actualizadas hoy</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {rows.filter((r) => {
                    const d = new Date(r.lastActivityAt);
                    const today = new Date();
                    return (
                      d.getFullYear() === today.getFullYear() &&
                      d.getMonth() === today.getMonth() &&
                      d.getDate() === today.getDate()
                    );
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por teléfono (ej: +549...)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as Filtro)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>Todos</option>
              <option>Activos</option>
              <option>Bloqueados</option>
            </select>
            <Button onClick={fetchRows} disabled={loading}>
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {filtered.map((row) => {
              const initials = row.phone?.replace("+", "")?.slice(-4) || "??";
              const isBlocked = row.status === "blocked";

              return (
                <div
                  key={row.from}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Teléfono (principal) */}
                    <div className="lg:col-span-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{row.phone}</h3>
                          <div className="text-sm text-gray-600">Canal: {row.from}</div>
                        </div>
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="lg:col-span-2">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">Estado</div>
                        <StatusBadge status={row.status} />
                      </div>
                    </div>

                    {/* Métricas */}
                    <div className="lg:col-span-3">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-600">
                          Mensajes: <span className="font-semibold">{row.conversationsCount}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Última actividad: <span className="font-semibold">{timeAgo(row.lastActivityAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="lg:col-span-2">
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => handleOpenConversation(row.phone)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Ver conversación
                        </Button>

                        <Button
                          size="sm"
                          className="w-full"
                          variant={isBlocked ? "default" : "destructive"}
                          onClick={() => handleToggleAgent(row)}
                        >
                          {isBlocked ? (
                            <>
                              <Power className="w-4 h-4 mr-2" />
                              Activar agente
                            </>
                          ) : (
                            <>
                              <PowerOff className="w-4 h-4 mr-2" />
                              Desactivar agente
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron conversaciones</h3>
              <p className="text-gray-600">Ajustá la búsqueda o el filtro de estado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de conversación */}
      <ConversationModal
        open={modalOpen}
        phone={selectedPhone}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
