"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PromptCard } from "./prompt-card";
import { PromptModal } from "./prompt-modal";
import { MessageCircle, Zap, BarChart3, Plus, Search, Settings } from "lucide-react";
import { listPrompts, activatePrompt, createPrompt, updatePrompt, type PromptBE } from "@/lib/api";
import { deletePrompt } from "@/lib/api"; // ← ver punto 3

type UIPrompt = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  usage: number;
  active: boolean;
  createdAt?: string;
};

export function AgenteIAPage() {
  const [data, setData] = useState<UIPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit" | "view">("view");
  const [selected, setSelected] = useState<UIPrompt | null>(null);

  const mapBEtoUI = (p: PromptBE): UIPrompt => ({
    id: p._id,
    title: p.nombre ?? "Sin nombre",
    description: (p.content || "").slice(0, 120) + ((p.content?.length || 0) > 120 ? "…" : ""),
    prompt: p.content,
    category: "General", // si más tarde agregás campo en BE, mapealo acá
    usage: 0,
    active: !!p.activo,
    createdAt: p.creadoEn,
  });

  const refresh = async () => {
    setLoading(true);
    try {
      const be = await listPrompts();
      setData(be.map(mapBEtoUI));
      setError(null);
    } catch (e: any) {
      setError(e.message || "Error cargando prompts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>(["Todas"]);
    data.forEach((p) => set.add(p.category || "General"));
    return Array.from(set);
  }, [data]);

  const filteredPrompts = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === "Todas" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data, searchTerm, selectedCategory]);

  const totalUsage = useMemo(() => data.reduce((sum, p) => sum + (p.usage || 0), 0), [data]);
  const activeCount = useMemo(() => data.filter((p) => p.active).length, [data]);

  // Acciones
  const handleActivate = async (id: string) => {
    try {
      await activatePrompt(id);
      await refresh();
    } catch (e: any) {
      alert(e.message || "No se pudo activar el prompt");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este prompt? Esta acción no se puede deshacer.")) return;
    try {
      await deletePrompt(id);
      await refresh();
    } catch (e: any) {
      alert(e.message || "No se pudo eliminar el prompt");
    }
  };

  // Modales
  const openView = (p: UIPrompt) => {
    setSelected(p);
    setMode("view");
    setIsOpen(true);
  };
  const openEdit = (p: UIPrompt) => {
    setSelected(p);
    setMode("edit");
    setIsOpen(true);
  };
  const openCreate = () => {
    setSelected(null);
    setMode("create");
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  const handleSave = async (form: { title: string; description: string; prompt: string; category: string }) => {
    try {
      if (mode === "create") {
        await createPrompt({ nombre: form.title, content: form.prompt, activo: false });
      } else if (mode === "edit" && selected) {
        await updatePrompt(selected.id, { nombre: form.title, content: form.prompt });
      }
      await refresh();
    } catch (e: any) {
      alert(e.message || "No se pudo guardar el prompt");
    }
  };

  if (loading) return <div className="p-8 text-gray-600">Cargando prompts…</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agente IA</h1>
          <p className="text-gray-600 mt-2">Gestiona y activa los prompts de tu agente de ventas con IA</p>
        </div>
        <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Agente Activo
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prompts Totales</p>
                <p className="text-2xl font-bold text-gray-900">{data.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prompts Activos</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Usos Totales</p>
                <p className="text-2xl font-bold text-purple-600">{new Intl.NumberFormat("es-AR").format(totalUsage)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categorías</p>
                <p className="text-2xl font-bold text-yellow-600">{categories.length - 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Biblioteca */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Biblioteca de Prompts</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Prompt
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Mostrando {filteredPrompts.length} de {data.length} prompts
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredPrompts.map((p) => (
              <PromptCard
                key={p.id}
                title={p.title}
                description={p.description}
                prompt={p.prompt}
                category={p.category}
                usage={p.usage}
                active={p.active}
                onMaximize={() => openView(p)}
                onEdit={() => openEdit(p)}
                onActivate={() => handleActivate(p.id)}
                onDelete={() => handleDelete(p.id)}
              />
            ))}
          </div>

          {filteredPrompts.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron prompts</h3>
              <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <PromptModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode={mode}
        onSave={async (form) => {
          await handleSave(form);
          setIsOpen(false);
        }}
        prompt={
          selected
            ? {
                title: selected.title,
                description: selected.description,
                prompt: selected.prompt,
                category: selected.category,
                usage: selected.usage,
                active: selected.active,
              }
            : undefined
        }
      />
    </div>
  );
}
