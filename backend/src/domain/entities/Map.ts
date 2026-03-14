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

  set name(value: string) {
    this.props.name = value;
  }

  get imageUrl(): string {
    return this.props.imageUrl;
  }

  set imageUrl(value: string) {
    this.props.imageUrl = value;
  }

  get gridConfig(): Record<string, any> {
    return this.props.gridConfig;
  }

  set gridConfig(value: Record<string, any>) {
    this.props.gridConfig = value;
  }

  get campaignId(): string {
    return this.props.campaignId;
  }
}
