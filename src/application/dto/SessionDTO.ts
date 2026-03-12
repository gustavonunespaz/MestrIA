export type SessionStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED';

export class CreateSessionDTO {
  title?: string;
  scheduledFor?: Date;
  status: SessionStatus;
  summary?: string;
  campaignId: string;

  constructor(data: {
    title?: string;
    scheduledFor?: Date;
    status: SessionStatus;
    summary?: string;
    campaignId: string;
  }) {
    this.title = data.title;
    this.scheduledFor = data.scheduledFor;
    this.status = data.status;
    this.summary = data.summary;
    this.campaignId = data.campaignId;
  }
}

export class UpdateSessionDTO {
  title?: string;
  scheduledFor?: Date;
  status?: SessionStatus;
  summary?: string;

  constructor(data: {
    title?: string;
    scheduledFor?: Date;
    status?: SessionStatus;
    summary?: string;
  }) {
    this.title = data.title;
    this.scheduledFor = data.scheduledFor;
    this.status = data.status;
    this.summary = data.summary;
  }
}

export class SessionResponseDTO {
  id: string;
  title?: string;
  scheduledFor?: Date;
  status: SessionStatus;
  summary?: string;
  campaignId: string;
  createdAt: Date;

  constructor(data: {
    id: string;
    title?: string;
    scheduledFor?: Date;
    status: SessionStatus;
    summary?: string;
    campaignId: string;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.scheduledFor = data.scheduledFor;
    this.status = data.status;
    this.summary = data.summary;
    this.campaignId = data.campaignId;
    this.createdAt = data.createdAt;
  }
}
