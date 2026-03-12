export type SenderRole = 'USER' | 'AI_DM' | 'HUMAN_DM' | 'SYSTEM';

export class CreateMessageDTO {
  content: string;
  senderId: string;
  campaignId: string;
  senderRole?: SenderRole;
  diceRoll?: Record<string, any>;
  isWhisper: boolean;

  constructor(data: {
    content: string;
    senderId: string;
    campaignId: string;
    senderRole?: SenderRole;
    diceRoll?: Record<string, any>;
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
  content?: string;
  diceRoll?: Record<string, any>;
  isWhisper?: boolean;

  constructor(data: {
    content?: string;
    diceRoll?: Record<string, any>;
    isWhisper?: boolean;
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
  senderRole?: SenderRole;
  diceRoll?: Record<string, any>;
  isWhisper: boolean;
  createdAt: Date;

  constructor(data: {
    id: string;
    content: string;
    senderId: string;
    campaignId: string;
    senderRole?: SenderRole;
    diceRoll?: Record<string, any>;
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
