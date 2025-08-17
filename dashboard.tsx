"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./components/sidebar";
import { MetricCard } from "./components/metric-card";
import { AIAgentStatus } from "./components/ai-agent-status";
import { AgenteIAPage } from "./components/agente-ia-page";
import { ConfiguracionPage } from "./components/configuracion-page";
import { ClientesPage } from "./components/clientes-page";
import { ConversacionesPage } from "./components/conversaciones-page";

import { listConversations, type ConversationRow } from "@/lib/messagesApi";
import { listContacts } from "@/lib/contactsApi";
import { listPrompts } from "@/lib/api";

import { MessageCircle, Power, Users, Target, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  // ---- Estado de métricas ----
  const [conv, setConv] = useState<ConversationRow[]>([]);
  const [contactsCount, setContactsCount] = useState(0);
  const [promptsCount, setPromptsCount] = useState(0);
  const [activePromptsCount, setActivePromptsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setErr(null);

        const [conversations, contacts, prompts] = await Promise.all([
          listConversations({ limit: 200 }), // tu BE ya ordena por lastActivityAt desc
          listContacts(),
          listPrompts(),
        ]);

        setConv(conversations || []);
        setContactsCount(contacts?.length || 0);
        setPromptsCount(prompts?.length || 0);
        setActivePromptsCount((prompts || []).filter((p) => !!p.activo).length);
      } catch (e: any) {
        setErr(e.message || "No se pudo cargar el dashboard");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  // ---- Derivados ----
  const totalConversations = conv.length;
  const activeAgents = useMemo(() => conv.filter((r) => r.status === "active").length, [conv]);

  const todayUpdated = useMemo(() => {
    const today = new Date();
    return conv.filter((r) => {
      const d = new Date(r.lastActivityAt);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    }).length;
  }, [conv]);

  const recent5 = useMemo(
    () => [...conv].sort((a, b) => +new Date(b.lastActivityAt) - +new Date(a.lastActivityAt)).slice(0, 5),
    [conv]
  );

  const timeAgo = (iso: string) => {
    const d = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - d);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Justo ahora";
    if (mins < 60) return `Hace ${mins} min`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `Hace ${h} h`;
    const days = Math.floor(h / 24);
    if (days < 7) return `Hace ${days} d`;
    const weeks = Math.floor(days / 7);
    return `Hace ${weeks} sem`;
  };

  const renderPage = () => {
    switch (currentPage) {
      case "agente-ia":
        return <AgenteIAPage />;
      case "configuracion":
        return <ConfiguracionPage />;
      case "conversaciones":
        return <ConversacionesPage />;
      case "clientes":
        return <ClientesPage />;
      case "dashboard":
      default:
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Resumen general de tu agente de ventas con IA</p>
            </div>

            {err && (
              <div className="flex items-center gap-2 text-red-600 mb-6">
                <AlertTriangle className="w-4 h-4" />
                {err}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Conversaciones únicas"
                value={loading ? "…" : String(totalConversations)}
                change={loading ? "" : `Actualizadas hoy: ${todayUpdated}`}
                icon={<MessageCircle className="w-6 h-6 text-white" />}
                iconBg="bg-blue-500"
              />
              <MetricCard
                title="Agentes activos"
                value={loading ? "…" : String(activeAgents)}
                change=""
                icon={<Power className="w-6 h-6 text-white" />}
                iconBg="bg-green-500"
              />
              <MetricCard
                title="Contactos guardados"
                value={loading ? "…" : String(contactsCount)}
                change=""
                icon={<Users className="w-6 h-6 text-white" />}
                iconBg="bg-purple-500"
              />
              <MetricCard
                title="Prompts (activos/total)"
                value={loading ? "…/…" : `${activePromptsCount}/${promptsCount}`}
                change=""
                icon={<Target className="w-6 h-6 text-white" />}
                iconBg="bg-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Actividad reciente (últimas 5 conversaciones) */}
              <Card>
                <CardHeader>
                  <CardTitle>Actividad reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-sm text-gray-500">Cargando…</div>
                  ) : recent5.length === 0 ? (
                    <div className="text-sm text-gray-500">Sin actividad aún.</div>
                  ) : (
                    <ul className="divide-y">
                      {recent5.map((r) => (
                        <li key={`${r.from}-${r.lastActivityAt}`} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{r.phone}</div>
                            <div className="text-xs text-gray-500">Canal: {r.from}</div>
                          </div>
                          <div className="text-sm text-gray-600">{timeAgo(r.lastActivityAt)}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Estado del Agente IA (tu componente existente) */}
              <AIAgentStatus />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 overflow-auto">{renderPage()}</div>
    </div>
  );
}
