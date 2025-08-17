// lib/contactsApi.ts
export type Contact = {
  _id: string;
  phone: string;          // "+549..."
  name?: string;
  tags?: string[];
  status?: string;        // active | blocked | test | prospect | customer
  agentEnabled?: boolean; // si false -> muteado
  createdAt?: string;
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

// Lista contactos
export async function listContacts(): Promise<Contact[]> {
  return api<Contact[]>("/api/contacts");
}

// Upsert por phone
export async function upsertContact(input: { phone: string; name?: string; tags?: string[] }) {
  return api<Contact>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// Toggle agente
export async function toggleAgent(contactId: string, enabled: boolean) {
  return api<{ ok: true; agentEnabled: boolean }>(`/api/contacts/${contactId}/agent`, {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });
}

// Enviar OUTBOUND por phone
export async function sendOutboundByPhone(phone: string, body: string) {
  return api<{ ok: true; sid: string; status: string }>("/api/contacts/send", {
    method: "POST",
    body: JSON.stringify({ phone, body }),
  });
}
