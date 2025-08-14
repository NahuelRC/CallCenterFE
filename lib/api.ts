const API = process.env.NEXT_PUBLIC_API_URL!;

export type PromptBE = {
  _id: string;
  nombre: string;
  content: string;
  activo?: boolean;
  creadoEn?: string;
};

export async function listPrompts(): Promise<PromptBE[]> {
  const r = await fetch(`${API}/api/prompts`, { cache: 'no-store' });
  if (!r.ok) throw new Error('Error listando prompts');
  return r.json();
}

export async function createPrompt(body: { nombre: string; content: string; activo?: boolean }) {
  const r = await fetch(`${API}/api/prompts`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('Error creando prompt');
  return r.json();
}

export async function updatePrompt(id: string, body: Partial<{ nombre: string; content: string; activo: boolean }>) {
  const r = await fetch(`${API}/api/prompts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('Error actualizando prompt');
  return r.json();
}

export async function activatePrompt(id: string) {
  const r = await fetch(`${API}/api/prompts/activar/${id}`, { method: 'PATCH' });
  if (!r.ok) throw new Error('Error activando prompt');
  return r.json();
}

export async function deletePrompt(id: string) {
  const r = await fetch(`${API}/api/prompts/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Error eliminando prompt");
  return r.json();
}
