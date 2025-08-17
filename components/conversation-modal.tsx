"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getHistory } from "@/lib/messagesApi";
import { sendOutboundByPhone } from "@/lib/contactsApi";
import { X, Send } from "lucide-react";

type Props = {
  open: boolean;
  phone: string | null;
  onClose: () => void;
};

export function ConversationModal({ open, phone, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<{ _id: string; from: string; mensaje: string; timestamp: string }[]>([]);
  const [outBody, setOutBody] = useState("");

  useEffect(() => {
    if (!open || !phone) return;
    const run = async () => {
      try {
        setLoading(true);
       const res = await getHistory(phone);
setItems(
  // si tu BE nuevo devuelve array con { id, from, phone, body, timestamp }:
  res.map((m) => ({
    _id: m.id,
    from: m.from,
    mensaje: m.body,
    timestamp: m.timestamp,
  }))
);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open, phone]);

  const handleSend = async () => {
    if (!phone || !outBody.trim()) return;
    try {
      await sendOutboundByPhone(phone, outBody.trim());
      setOutBody("");
      // Opcional: refrescar historial (si guardás outbound en DB; hoy solo verás inbound)
      // const res = await getHistory(phone); setItems(res.items);
      alert("Mensaje enviado ✅");
    } catch (e: any) {
      alert(e.message || "No se pudo enviar");
    }
  };

  if (!open || !phone) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-lg overflow-hidden">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Conversación con {phone}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto border rounded-md p-3 bg-gray-50">
              {loading ? (
                <div className="text-gray-500 text-sm">Cargando historial…</div>
              ) : items.length === 0 ? (
                <div className="text-gray-500 text-sm">Sin mensajes (por ahora solo se registran entrantes).</div>
              ) : (
                <ul className="space-y-3">
                  {items.map((m) => (
                    <li key={m._id} className="text-sm">
                      <div className="text-gray-500">{new Date(m.timestamp).toLocaleString()}</div>
                      <div className="font-mono whitespace-pre-wrap">{m.mensaje}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Escribe un mensaje…"
                value={outBody}
                onChange={(e) => setOutBody(e.target.value)}
              />
              <Button onClick={handleSend}>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
