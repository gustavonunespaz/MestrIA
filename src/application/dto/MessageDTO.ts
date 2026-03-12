export type SenderRole = 'USER' | 'AI_DM' | 'HUMAN_DM' | 'SYSTEM';

export class CreateMessageDTO {
  content: string;
  senderId: string;
  campaignId: string;
  senderRole?: SenderRole | null;
  diceRoll?: Record<string, any> | null;
  isWhisper: boolean;

  constructor(data: {
    content: string;
    senderId: string;
    campaignId: string;
    senderRole?: SenderRole | null;
    diceRoll?: Record<string, any> | null;
    isWhisper: boolean;
  }) {
    this.content = data.content;
    this.senderId = data.senderId;
    this.campaignId = data.campaignId;
    this.senderRole = data.senderRole;
    this.diceRoll = data.diceRoll;
    this.isWhisper = data.isWhisper;
  }
}

export class UpdateMessageDTO {
  content?: string | null;
  diceRoll?: Record<string, any> | null;
  isWhisper?: boolean | null;

  constructor(data: {
    content?: string | null;
    diceRoll?: Record<string, any> | null;
    isWhisper?: boolean | null;
  }) {
    this.content = data.content;
    this.diceRoll = data.diceRoll;
    this.isWhisper = data.isWhisper;
  }
}

export class MessageResponseDTO {
  id: string;
  content: string;
  senderId: string;
  campaignId: string;
  senderRole?: SenderRole | null;
  diceRoll?: Record<string, any> | null;
  isWhisper: boolean;
  createdAt: Date;

  constructor(data: {
    id: string;
    content: string;
    senderId: string;
    campaignId: string;
    senderRole?: SenderRole | null;
    diceRoll?: Record<string, any> | null;
    isWhisper: boolean;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.content = data.content;
    this.senderId = data.senderId;
    this.campaignId = data.campaignId;
    this.senderRole = data.senderRole;
    this.diceRoll = data.diceRoll;
    this.isWhisper = data.isWhisper;
    this.createdAt = data.createdAt;
  }
}
