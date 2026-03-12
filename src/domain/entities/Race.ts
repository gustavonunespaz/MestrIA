export interface RaceProps {
  id: string;
  name: string;
  description?: string;
  traits: Record<string, any>;
}

export class Race {
  private props: RaceProps;

  constructor(props: RaceProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get traits(): Record<string, any> {
    return this.props.traits;
  }
}
