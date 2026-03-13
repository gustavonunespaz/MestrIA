export interface RaceProps {
  id: string;
  name: string;
  description?: string | null;
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

  set name(value: string) {
    this.props.name = value;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  set description(value: string | null | undefined) {
    this.props.description = value;
  }

  get traits(): Record<string, any> {
    return this.props.traits;
  }

  set traits(value: Record<string, any>) {
    this.props.traits = value;
  }
}
