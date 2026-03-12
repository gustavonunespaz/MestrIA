export interface MonsterTemplateProps {
  id: string;
  name: string;
  challenge: number;
  armorClass: number;
  hitPoints: number;
  stats: Record<string, any>;
  actions: Record<string, any>;
}

export class MonsterTemplate {
  private props: MonsterTemplateProps;

  constructor(props: MonsterTemplateProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get challenge(): number {
    return this.props.challenge;
  }

  get armorClass(): number {
    return this.props.armorClass;
  }

  get hitPoints(): number {
    return this.props.hitPoints;
  }

  get stats(): Record<string, any> {
    return this.props.stats;
  }

  get actions(): Record<string, any> {
    return this.props.actions;
  }
}
