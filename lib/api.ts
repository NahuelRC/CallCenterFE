// lib/api.ts
// 👉 Con rewrite, usamos mismo origen (ruta relativa).
//    Si querés forzar una base distinta, seteá NEXT_PUBLIC_API_BASE.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

export type PromptBE = {
  _id: string;
  nombre: string;
  content: string;
  activo?: boolean;
  creadoEn?: string;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
    ...init,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      // respuesta no-JSON
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// GET /api/prompts
export async function listPrompts(): Promise<PromptBE[]> {
  return apiFetch<PromptBE[]>('/api/prompts');
}

// POST /api/prompts
export async function createPrompt(body: { nombre: string; content: string; activo?: boolean }) {
  return apiFetch<PromptBE>('/api/prompts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// PUT /api/prompts/:id
export async function updatePrompt(
  id: string,
  body: Partial<{ nombre: string; content: string; activo: boolean }>
) {
  return apiFetch<PromptBE>(`/api/prompts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// PATCH /api/prompts/activar/:id
export async function activatePrompt(id: string) {
  return apiFetch<{ message: string; prompt: PromptBE }>(`/api/prompts/activar/${id}`, {
    method: 'PATCH',
  });
}

// DELETE /api/prompts/:id
export async function deletePrompt(id: string) {
  return apiFetch<{ ok: true }>(`/api/prompts/${id}`, {
    method: 'DELETE',
  });
}
