export interface MapProps {
  id: string;
  name: string;
  imageUrl: string;
  gridConfig: Record<string, any>;
  campaignId: string;
}

export class Map {
  private props: MapProps;

  constructor(props: MapProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  get gridConfig(): Record<string, any> {
    return this.props.gridConfig;
  }

  get campaignId(): string {
    return this.props.campaignId;
  }
}
