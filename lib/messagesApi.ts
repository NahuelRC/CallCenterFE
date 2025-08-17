// lib/messagesApi.ts
export type ConversationRow = {
  phone: string;                 // "+549..."
  messagesCount: number;         // total mensajes (inbound)
  lastMessageAt: string;         // ISO date
  lastMessage?: { mensaje: string; timestamp: string };
};

export type HistoryMessage = {
  _id: string;
  from: string;                  // "whatsapp:+549..." del remitente
  mensaje: string;
  timestamp: string;
};

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try {
      const j = await r.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return r.json();
}

// Lista conversaciones agregadas desde Messages
export async function listConversations(params?: { page?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  const qs = q.toString() ? `?${q.toString()}` : "";
  return api<{ items: ConversationRow[]; page: number; pages: number; total: number }>(
    `/api/messages/conversations${qs}`
  );
}

// Historial por teléfono
export async function getHistory(phone: string) {
  const qs = `?phone=${encodeURIComponent(phone)}`;
  return api<{ items: HistoryMessage[] }>(`/api/messages/history${qs}`);
}
