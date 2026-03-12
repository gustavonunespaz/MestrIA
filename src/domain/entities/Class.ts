export interface ClassProps {
  id: string;
  name: string;
  description?: string;
  hitDice: string;
}

export class Class {
  private props: ClassProps;

  constructor(props: ClassProps) {
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

  get hitDice(): string {
    return this.props.hitDice;
  }
}
