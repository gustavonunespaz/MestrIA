export type DmType = 'AI' | 'HUMAN';
export type SenderRole = 'USER' | 'AI_DM' | 'HUMAN_DM' | 'SYSTEM';
export type SessionStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  inviteCode?: string;
  systemBase: string;
  dmType: DmType;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  members?: CampaignMember[];
  _count?: { members: number; characters: number; messages: number };
}

export interface CampaignMember {
  id: string;
  joinedAt: string;
  userId: string;
  campaignId: string;
  user?: User;
}

export interface Race {
  id: string;
  name: string;
  description?: string;
  traits: Record<string, unknown>;
}

export interface CharClass {
  id: string;
  name: string;
  description?: string;
  hitDice: string;
}

export interface Character {
  id: string;
  name: string;
  level: number;
  hpCurrent: number;
  hpMax: number;
  isBot: boolean;
  botType?: string;
  avatarUrl?: string;
  attributes: Record<string, number>;
  isAlive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  campaignId: string;
  raceId: string;
  classId: string;
  race?: Race;
  class?: CharClass;
  items?: CharacterItemWithTemplate[];
  spells?: CharacterSpellWithTemplate[];
}

export interface ItemTemplate {
  id: string;
  name: string;
  type: string;
  description?: string;
  properties: Record<string, unknown>;
}

export interface SpellTemplate {
  id: string;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  duration?: string;
  description?: string;
  damage?: Record<string, unknown>;
}

export interface CharacterItemWithTemplate {
  id: string;
  characterId: string;
  itemId: string;
  item: ItemTemplate;
}

export interface CharacterSpellWithTemplate {
  id: string;
  characterId: string;
  spellId: string;
  spell: SpellTemplate;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  diceRoll?: { dice: string; result: number; total: number } | null;
  isWhisper: boolean;
  senderRole?: SenderRole;
  createdAt: string;
  campaignId: string;
  sender?: User;
}

export interface Session {
  id: string;
  title?: string;
  scheduledFor?: string;
  status: SessionStatus;
  summary?: string;
  createdAt: string;
  campaignId: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
