export type SessionStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED';

export interface SessionProps {
  id: string;
  title?: string;
  scheduledFor?: Date;
  status: SessionStatus;
  summary?: string;
  campaignId: string;
  createdAt: Date;
}

export class Session {
  private props: SessionProps;

  constructor(props: SessionProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string | undefined {
    return this.props.title;
  }

  get scheduledFor(): Date | undefined {
    return this.props.scheduledFor;
  }

  get status(): SessionStatus {
    return this.props.status;
  }

  get summary(): string | undefined {
    return this.props.summary;
  }

  get campaignId(): string {
    return this.props.campaignId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
