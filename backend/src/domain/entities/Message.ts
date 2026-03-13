export type SenderRole = 'USER' | 'AI_DM' | 'HUMAN_DM' | 'SYSTEM';

export interface MessageProps {
  id: string;
  content: string;
  senderId: string;
  campaignId: string;
  senderRole?: SenderRole | null;
  diceRoll?: Record<string, any> | null;
  isWhisper: boolean;
  createdAt: Date;
}

export class Message {
  private props: MessageProps;

  constructor(props: MessageProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get content(): string {
    return this.props.content;
  }

  set content(value: string) {
    this.props.content = value;
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get campaignId(): string {
    return this.props.campaignId;
  }

  get senderRole(): SenderRole | null | undefined {
    return this.props.senderRole;
  }

  set senderRole(value: SenderRole | null | undefined) {
    this.props.senderRole = value;
  }

  get diceRoll(): Record<string, any> | null | undefined {
    return this.props.diceRoll;
  }

  set diceRoll(value: Record<string, any> | null | undefined) {
    this.props.diceRoll = value;
  }

  get isWhisper(): boolean {
    return this.props.isWhisper;
  }

  set isWhisper(value: boolean) {
    this.props.isWhisper = value;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
