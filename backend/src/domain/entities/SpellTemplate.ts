export interface SpellTemplateProps {
  id: string;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  duration?: string;
  description?: string | null;
  higherLevel?: string | null;
  damage?: Record<string, any>;
}

export class SpellTemplate {
  private props: SpellTemplateProps;

  constructor(props: SpellTemplateProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get level(): number {
    return this.props.level;
  }

  get school(): string | undefined {
    return this.props.school;
  }

  get castingTime(): string | undefined {
    return this.props.castingTime;
  }

  get range(): string | undefined {
    return this.props.range;
  }

  get duration(): string | undefined {
    return this.props.duration;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get damage(): Record<string, any> | undefined {
    return this.props.damage;
  }
}
