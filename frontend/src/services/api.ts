import type { AuthResponse, Campaign, Character, LoginPayload, Message, User, Session, Race, CharClass } from '@/types/models';

const API_BASE = 'http://localhost:3000/api';

function getToken(): string | null {
  return localStorage.getItem('mestria_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
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
}

export const api = {
  // Auth
  login: (data: LoginPayload) => request<AuthResponse>('/users/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: LoginPayload & { name: string }) => request<AuthResponse>('/users', { method: 'POST', body: JSON.stringify(data) }),
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
  getMessages: (campaignId: string) => request<Message[]>(`/messages/campaign/${campaignId}`),
  sendMessage: (campaignId: string, content: string) =>
    request<Message>('/messages/crud', { method: 'POST', body: JSON.stringify({ campaignId, content }) }),

  // AI
  generateAI: (campaignId: string, prompt: string) =>
    request<{ response: string }>('/ai/generate', { method: 'POST', body: JSON.stringify({ campaignId, message: prompt }) }),

  // Sessions
  getSessions: (campaignId: string) => request<Session[]>(`/sessions/campaign/${campaignId}`),
  createSession: (data: { campaignId: string; title?: string; scheduledFor?: string }) =>
    request<Session>('/sessions', { method: 'POST', body: JSON.stringify(data) }),
};
