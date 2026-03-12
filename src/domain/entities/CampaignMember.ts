export interface CampaignMemberProps {
  id: string;
  userId: string;
  campaignId: string;
  joinedAt: Date;
}

export class CampaignMember {
  private props: CampaignMemberProps;

  constructor(props: CampaignMemberProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get campaignId(): string {
    return this.props.campaignId;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }
}
