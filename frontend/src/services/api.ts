import type { AuthResponse, Campaign, Character, LoginPayload, Message, User, Session, Race, CharClass } from '@/types/models';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getToken(): string | null {
  return localStorage.getItem('mestria_token');
}

async function request<T>(path: string, options: RequestInit = {}, timeoutMs: number = 8000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const token = getToken();
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || 'Request failed');
    }
    return res.json();
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  // Auth
  login: async (data: LoginPayload) => {
    const res = await request<any>('/users/auth/login', { method: 'POST', body: JSON.stringify(data) });
    return normalizeAuthResponse(res);
  },
  register: async (data: LoginPayload & { name: string }) => {
    const res = await request<any>('/users', { method: 'POST', body: JSON.stringify(data) });
    if (res?.token || res?.user) {
      return normalizeAuthResponse(res);
    }
    const loginRes = await request<any>('/users/auth/login', { method: 'POST', body: JSON.stringify({ email: data.email, password: data.password }) });
    return normalizeAuthResponse(loginRes);
  },
  getMe: () => request<User>('/users/auth/me'),

  // Campaigns
  getCampaigns: () => request<Campaign[]>('/campaigns/list'),
  getCampaign: (id: string) => request<Campaign>(`/campaigns/${id}`),
  createCampaign: (data: { title: string; description: string; systemBase: string; dmType: string }) =>
    request<Campaign>('/campaigns', { method: 'POST', body: JSON.stringify(data) }),

  // Characters
  getCharacters: (campaignId: string) => request<Character[]>(`/characters/campaign/list?campaignId=${campaignId}`),
  getCharacter: (campaignId: string, charId: string) => request<Character>(`/characters/${charId}`),
  createCharacter: (data: any) => request<Character>('/characters', { method: 'POST', body: JSON.stringify(data) }),

  // Raca e Classe
  getRaces: () => request<Race[]>('/races'),
  getClasses: () => request<CharClass[]>('/classes'),

  // Messages
  getMessages: async (campaignId: string) => {
    const res = await request<any>(`/messages/campaign/${campaignId}`);
    if (Array.isArray(res)) return res as Message[];
    if (res && Array.isArray(res.messages)) return res.messages as Message[];
    return [];
  },
  sendMessage: (
    campaignId: string,
    content: string,
    options?: { senderRole?: string; diceRoll?: unknown; isWhisper?: boolean },
  ) =>
    request<Message>('/messages/crud', {
      method: 'POST',
      body: JSON.stringify({ campaignId, content, ...options }),
    }),

  // AI
  generateAI: async (
    campaignId: string,
    prompt: string,
    options?: { characterId?: string | null; type?: string | null },
  ) => {
    const res = await request<any>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ campaignId, message: prompt, ...options }),
    }, 60000);
    return {
      content: res?.content || res?.response || '',
      model: res?.model,
      source: res?.source,
    };
  },

  // Sessions
  getSessions: (campaignId: string) => request<Session[]>(`/sessions/campaign/${campaignId}`),
  createSession: (data: { campaignId: string; title?: string; scheduledFor?: string }) =>
    request<Session>('/sessions', { method: 'POST', body: JSON.stringify(data) }),
};

function normalizeAuthResponse(res: any): AuthResponse {
  if (!res) {
    throw new Error('Auth response inválida');
  }
  if (res.user && res.token) {
    return { token: res.token, user: res.user };
  }
  if (res.id && res.email) {
    return {
      token: res.token,
      user: { id: res.id, name: res.name, email: res.email },
    };
  }
  throw new Error('Auth response inválida');
}
