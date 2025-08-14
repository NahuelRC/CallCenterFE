// lib/twilioApi.ts
export type TwilioConfigDTO = {
  accountSid?: string;
  authTokenMasked?: string; // el BE devuelve el token enmascarado
  fromNumber?: string;      // ej: "whatsapp:+549341..."
  webhookUrl?: string;
};

type SaveBody = {
  accountSid: string;
  authToken: string;   // en claro SOLO al guardar
  fromNumber: string;  // preferible con prefijo "whatsapp:+..."
  webhookUrl?: string;
};

type TestResponse = {
  ok: boolean;
  messageSid?: string;
  error?: string;
};

// Usa NEXT_PUBLIC_API_URL si existe; si no, intenta el mismo origen (útil en dev con proxy)
const API =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined" ? window.location.origin : "");

// Helper fetch con manejo de errores
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// GET /api/twilio/config
export async function getTwilioConfig(): Promise<TwilioConfigDTO> {
  return apiFetch<TwilioConfigDTO>("/api/twilio/config", { cache: "no-store" });
}

// PUT /api/twilio/config
export async function saveTwilioConfig(body: SaveBody): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/api/twilio/config", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

// POST /api/twilio/test   (opcionalmente con { to: "+549..." })
export async function testTwilioConnection(to?: string) {
  return apiFetch<TestResponse>("/api/twilio/test", {
    method: "POST",
    body: JSON.stringify({ testTo: to }), // ✅ coincide con BE
  });
}
