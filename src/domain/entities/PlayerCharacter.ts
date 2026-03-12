export interface PlayerCharacterProps {
  id: string;
  userId: string;
  campaignId: string;
}

export class PlayerCharacter {
  private props: PlayerCharacterProps;

  constructor(props: PlayerCharacterProps) {
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
}
