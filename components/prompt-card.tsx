"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Trash2, Zap, Maximize2 } from "lucide-react";

export interface PromptCardProps {
  title: string;
  description: string;
  prompt: string;
  category: string;
  usage: number;
  active?: boolean;
  onEdit?: () => void;
  onMaximize?: () => void;
  onActivate?: () => void;
  onDelete?: () => void;               // ← NUEVO
  extraAction?: React.ReactNode;
}

export function PromptCard({
  title,
  // description,
  prompt,
  category,
  usage,
  active = false,
  onEdit,
  onMaximize,
  onActivate,
  onDelete,                             // ← NUEVO
  extraAction,
}: PromptCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${active ? "ring-2 ring-green-500 bg-green-50" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              {active && (
                <Badge className="bg-green-600 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Activo
                </Badge>
              )}
            </div>
            {/* <p className="text-sm text-gray-600">{description}</p> */}
          </div>
          {extraAction /* si querés inyectar algo custom desde afuera */}
        </div>
      </CardHeader>

      <CardContent>
        <div className="bg-gray-50 p-4 rounded-lg mb-4 relative group">
          <p className="text-sm text-gray-700 font-mono line-clamp-4">{prompt}</p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onMaximize}
            title="Ver completo"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {category}
          </span>
          {/*<span className="text-sm text-gray-500">Usado {new Intl.NumberFormat("es-AR").format(usage)} veces</span>*/}
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant={active ? "secondary" : "default"}
            size="sm"
            className={active ? "bg-gray-200 text-gray-600" : "bg-green-600 hover:bg-green-700"}
            disabled={active}
            onClick={!active ? onActivate : undefined}
          >
            {active ? "Activado" : "Activar"}
          </Button>

          <div className="flex gap-1">
           {/* <Button variant="ghost" size="sm" onClick={handleCopy} title="Copiar prompt">
              <Copy className="w-4 h-4" />
            </Button>*/}
            <Button variant="ghost" size="sm" onClick={onEdit} title="Editar prompt">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} title="Eliminar prompt">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
