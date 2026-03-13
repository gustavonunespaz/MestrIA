export type SessionStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED';

export class CreateSessionDTO {
  title?: string | null;
  scheduledFor?: Date;
  status: SessionStatus;
  summary?: string | null;
  campaignId: string;

  constructor(data: {
    title?: string | null;
    scheduledFor?: Date;
    status: SessionStatus;
    summary?: string | null;
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
  title?: string | null;
  scheduledFor?: Date;
  status?: SessionStatus;
  summary?: string | null;

  constructor(data: {
    title?: string | null;
    scheduledFor?: Date;
    status?: SessionStatus;
    summary?: string | null;
  }) {
    this.title = data.title;
    this.scheduledFor = data.scheduledFor;
    this.status = data.status;
    this.summary = data.summary;
  }
}

export class SessionResponseDTO {
  id: string;
  title?: string | null;
  scheduledFor?: Date;
  status: SessionStatus;
  summary?: string | null;
  campaignId: string;
  createdAt: Date;

  constructor(data: {
    id: string;
    title?: string | null;
    scheduledFor?: Date;
    status: SessionStatus;
    summary?: string | null;
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
