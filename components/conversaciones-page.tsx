"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, MessageCircle, Power, UserPlus } from "lucide-react";

import { listConversations, type ConversationRow } from "@/lib/messagesApi";
import { listContacts, upsertContact, toggleAgent, type Contact } from "@/lib/contactsApi";
import { ConversationModal } from "./conversation-modal";

type RowUI = {
  phone: string;
  messagesCount: number;
  lastMessageAt: string;
  lastMessageText?: string;
  contactId?: string;
  agentEnabled?: boolean; // undefined => no contact
};

export function ConversacionesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"Todos" | "Activos" | "Muteados" | "SinContacto">("Todos");
  const [rows, setRows] = useState<RowUI[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [convRes, contacts] = await Promise.all([
        listConversations({ page: 1, limit: 50 }),
        listContacts(),
      ]);

      const byPhone = new Map<string, Contact>();
      contacts.forEach((c) => byPhone.set(c.phone, c));

      const mapped: RowUI[] = convRes.items.map((c) => {
        const contact = byPhone.get(c.phone);
        return {
          phone: c.phone,
          messagesCount: c.messagesCount,
          lastMessageAt: c.lastMessageAt,
          lastMessageText: c.lastMessage?.mensaje,
          contactId: contact?._id,
          agentEnabled: contact?.agentEnabled,
        };
      });

      // ord descendente por última actividad
      mapped.sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
      setRows(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch =
        !term || r.phone.toLowerCase().includes(term) || r.lastMessageText?.toLowerCase().includes(term);
      const matchesFilter =
        filter === "Todos" ||
        (filter === "Activos" && r.agentEnabled === true) ||
        (filter === "Muteados" && r.agentEnabled === false) ||
        (filter === "SinContacto" && typeof r.agentEnabled === "undefined");
      return matchesSearch && matchesFilter;
    });
  }, [rows, searchTerm, filter]);

  const badgeEstado = (r: RowUI) => {
    if (typeof r.agentEnabled === "undefined") {
      return <Badge className="bg-gray-100 text-gray-700">Sin contacto</Badge>;
    }
    return r.agentEnabled ? (
      <Badge className="bg-green-100 text-green-800">Activo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Muteado</Badge>
    );
  };

  const handleView = (phone: string) => {
    setSelectedPhone(phone);
    setOpenModal(true);
  };

  const handleToggleAgent = async (r: RowUI) => {
    try {
      if (!r.contactId) {
        alert("Primero guarda el contacto para poder mutear/activar.");
        return;
      }
      const next = !(r.agentEnabled ?? true);
      await toggleAgent(r.contactId, next);
      await load();
    } catch (e: any) {
      alert(e.message || "No se pudo cambiar el estado del agente");
    }
  };

  const handleSaveContact = async (phone: string) => {
    try {
      await upsertContact({ phone });
      await load();
    } catch (e: any) {
      alert(e.message || "No se pudo guardar el contacto");
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Conversaciones</h1>
        <p className="text-gray-600 mt-2">WhatsApp entrantes agrupados por número</p>
      </div>

      {/* Stats + Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total conversaciones</p>
                <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* puedes sumar más cards si querés */}
      </div>

      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por teléfono o texto…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Todos">Todos</option>
                <option value="Activos">Activos</option>
                <option value="Muteados">Muteados</option>
                <option value="SinContacto">Sin contacto</option>
              </select>
            </div>
            <Button variant="outline" onClick={load} disabled={loading}>
              Refrescar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Conversaciones ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-gray-500">Cargando…</div>
          ) : filtered.length === 0 ? (
            <div className="text-gray-500">Sin resultados</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div
                  key={r.phone}
                  className="border rounded-lg p-4 flex items-center justify-between hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-semibold">
                      {r.phone.replace('+', '').slice(-2)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{r.phone}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(r.lastMessageAt).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700 line-clamp-1">
                        {r.lastMessageText || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Mensajes</div>
                      <div className="font-semibold">{r.messagesCount}</div>
                    </div>
                    {badgeEstado(r)}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleView(r.phone)}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ver conversación
                      </Button>

                      {typeof r.agentEnabled === "undefined" ? (
                        <Button variant="outline" size="sm" onClick={() => handleSaveContact(r.phone)}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Guardar contacto
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant={r.agentEnabled ? "destructive" : "default"}
                          onClick={() => handleToggleAgent(r)}
                        >
                          <Power className="w-4 h-4 mr-2" />
                          {r.agentEnabled ? "Desactivar agente" : "Activar agente"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConversationModal
        open={openModal}
        phone={selectedPhone}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}
