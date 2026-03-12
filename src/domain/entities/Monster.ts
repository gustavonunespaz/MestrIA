export interface MonsterProps {
  id: string;
  name: string;
  monsterTemplateId: string;
  campaignId: string;
  characterId?: string | null;
}

export class Monster {
  private props: MonsterProps;

  constructor(props: MonsterProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get monsterTemplateId(): string {
    return this.props.monsterTemplateId;
  }

  get campaignId(): string {
    return this.props.campaignId;
  }

  get characterId(): string | null | undefined {
    return this.props.characterId;
  }
}
