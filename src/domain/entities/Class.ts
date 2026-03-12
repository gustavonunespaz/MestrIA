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

  set name(value: string) {
    this.props.name = value;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  set description(value: string | undefined) {
    this.props.description = value;
  }

  get hitDice(): string {
    return this.props.hitDice;
  }

  set hitDice(value: string) {
    this.props.hitDice = value;
  }
}
