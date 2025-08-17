// lib/messagesApi.ts

export type ConversationRow = {
  from: string;                 // "whatsapp:+549..."
  phone: string;                // "+549..."
  status: string;               // "active" | "blocked" | ...
  conversationsCount: number;   // total de mensajes (conteo)
  lastActivityAt: string;       // ISO date
};

export type HistoryMessage = {
  id: string;
  from: string;                 // "whatsapp:+549..."
  phone: string;                // "+549..."
  body: string;                 // texto del mensaje
  timestamp: string;            // ISO date
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
  return r.json() as Promise<T>;
}

/**
 * GET /api/conversations
 * Query opcionales: search, limit, offset
 * Devuelve: ConversationRow[]
 */
export async function listConversations(params?: {
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.offset != null) q.set("offset", String(params.offset));
  const qs = q.toString() ? `?${q.toString()}` : "";
  return api<ConversationRow[]>(`/api/conversations${qs}`);
}

/**
 * GET /api/conversations/:phone/messages
 * Query opcionales: limit, before, after
 * Devuelve: HistoryMessage[]
 */
export async function getHistory(
  phone: string,
  params?: { limit?: number; before?: string; after?: string }
) {
  const q = new URLSearchParams();
  if (params?.limit != null) q.set("limit", String(params.limit));
  if (params?.before) q.set("before", params.before);
  if (params?.after) q.set("after", params.after);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const safePhone = encodeURIComponent(phone);
  return api<HistoryMessage[]>(`/api/conversations/${safePhone}/messages${qs}`);
}

/**
 * PATCH /api/conversations/:phone/deactivate
 */
export async function deactivateAgentByPhone(phone: string) {
  const safePhone = encodeURIComponent(phone);
  return api<{ ok: true; status: string }>(
    `/api/conversations/${safePhone}/deactivate`,
    { method: "PATCH" }
  );
}

/**
 * PATCH /api/conversations/:phone/activate
 */
export async function activateAgentByPhone(phone: string) {
  const safePhone = encodeURIComponent(phone);
  return api<{ ok: true; status: string }>(
    `/api/conversations/${safePhone}/activate`,
    { method: "PATCH" }
  );
}
