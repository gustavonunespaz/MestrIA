export interface CampaignProps {
  id: string;
  title: string;
  description?: string | null;
  systemBase: string;
  dmType: 'AI' | 'HUMAN';
  creatorId: string;
  inviteCode?: string | null;
  membersCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Campaign {
  id: string;
  title: string;
  description?: string | null;
  systemBase: string;
  dmType: 'AI' | 'HUMAN';
  creatorId: string;
  inviteCode?: string | null;
  membersCount?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(props: CampaignProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.systemBase = props.systemBase;
    this.dmType = props.dmType;
    this.creatorId = props.creatorId;
    this.inviteCode = props.inviteCode;
    this.membersCount = props.membersCount;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
