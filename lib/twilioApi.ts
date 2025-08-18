// lib/twilioApi.ts
export type TwilioConfigDTO = {
  accountSid?: string;
  authTokenMasked?: string;
  fromNumber?: string;
  webhookUrl?: string;
};

type SaveBody = {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  webhookUrl?: string;
};

type TestResponse = {
  ok: boolean;
  messageSid?: string;
  error?: string;
};

// Helper fetch con manejo de errores (SIN dominio absoluto)
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
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

export async function getTwilioConfig(): Promise<TwilioConfigDTO> {
  return apiFetch<TwilioConfigDTO>('/api/twilio/config', { cache: 'no-store' });
}

export async function saveTwilioConfig(body: SaveBody): Promise<{ ok: true; updatedAt?: string }> {
  return apiFetch<{ ok: true; updatedAt?: string }>('/api/twilio/config', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function testTwilioConnection(to?: string): Promise<TestResponse> {
  return apiFetch<TestResponse>('/api/twilio/test', {
    method: 'POST',
    body: JSON.stringify({ testTo: to }),
  });
}
