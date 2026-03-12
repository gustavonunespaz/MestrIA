export type SenderRole = 'USER' | 'AI_DM' | 'HUMAN_DM' | 'SYSTEM';

export interface MessageProps {
  id: string;
  content: string;
  senderId: string;
  campaignId: string;
  senderRole?: SenderRole;
  diceRoll?: Record<string, any>;
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

  get senderId(): string {
    return this.props.senderId;
  }

  get campaignId(): string {
    return this.props.campaignId;
  }

  get senderRole(): SenderRole | undefined {
    return this.props.senderRole;
  }

  get diceRoll(): Record<string, any> | undefined {
    return this.props.diceRoll;
  }

  get isWhisper(): boolean {
    return this.props.isWhisper;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
