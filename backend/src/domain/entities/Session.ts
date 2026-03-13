export type SessionStatus = 'PLANNED' | 'ACTIVE' | 'FINISHED';

export interface SessionProps {
  id: string;
  title?: string | null;
  scheduledFor?: Date;
  status: SessionStatus;
  summary?: string | null;
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

  get title(): string | null | undefined {
    return this.props.title;
  }

  set title(value: string | null | undefined) {
    this.props.title = value;
  }

  get scheduledFor(): Date | undefined {
    return this.props.scheduledFor;
  }

  set scheduledFor(value: Date | undefined) {
    this.props.scheduledFor = value;
  }

  get status(): SessionStatus {
    return this.props.status;
  }

  set status(value: SessionStatus) {
    this.props.status = value;
  }

  get summary(): string | null | undefined {
    return this.props.summary;
  }

  set summary(value: string | null | undefined) {
    this.props.summary = value;
  }

  get campaignId(): string {
    return this.props.campaignId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
