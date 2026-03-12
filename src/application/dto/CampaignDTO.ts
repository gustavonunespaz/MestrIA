export class CreateCampaignDTO {
  title: string;
  description: string;
  systemBase: string;
  dmType: 'AI' | 'HUMAN';

  constructor(data: {
    title: string;
    description: string;
    systemBase: string;
    dmType: 'AI' | 'HUMAN';
  }) {
    this.title = data.title;
    this.description = data.description;
    this.systemBase = data.systemBase;
    this.dmType = data.dmType;
  }
}

export class UpdateCampaignDTO {
  title?: string;
  description?: string;
  systemBase?: string;

  constructor(data: {
    title?: string;
    description?: string;
    systemBase?: string;
  }) {
    this.title = data.title;
    this.description = data.description;
    this.systemBase = data.systemBase;
  }
}

export class CampaignResponseDTO {
  id: string;
  title: string;
  description: string;
  systemBase: string;
  dmType: 'AI' | 'HUMAN';
  creatorId: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    title: string;
    description: string;
    systemBase: string;
    dmType: 'AI' | 'HUMAN';
    creatorId: string;
    inviteCode: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.systemBase = data.systemBase;
    this.dmType = data.dmType;
    this.creatorId = data.creatorId;
    this.inviteCode = data.inviteCode;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
