export interface ItemTemplateProps {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  properties: Record<string, any>;
}

export class ItemTemplate {
  private props: ItemTemplateProps;

  constructor(props: ItemTemplateProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get type(): string {
    return this.props.type;
  }

  get description(): string | null | undefined {
    return this.props.description;
  }

  get properties(): Record<string, any> {
    return this.props.properties;
  }
}
