export class CreateMapDTO {
  name: string;
  imageUrl: string;
  gridConfig: Record<string, any>;
  campaignId: string;

  constructor(data: { name: string; imageUrl: string; gridConfig: Record<string, any>; campaignId: string }) {
    this.name = data.name;
    this.imageUrl = data.imageUrl;
    this.gridConfig = data.gridConfig;
    this.campaignId = data.campaignId;
  }
}

export class UpdateMapDTO {
  name?: string;
  imageUrl?: string;
  gridConfig?: Record<string, any>;

  constructor(data: { name?: string; imageUrl?: string; gridConfig?: Record<string, any> }) {
    this.name = data.name;
    this.imageUrl = data.imageUrl;
    this.gridConfig = data.gridConfig;
  }
}

export class MapResponseDTO {
  id: string;
  name: string;
  imageUrl: string;
  gridConfig: Record<string, any>;
  campaignId: string;

  constructor(data: { id: string; name: string; imageUrl: string; gridConfig: Record<string, any>; campaignId: string }) {
    this.id = data.id;
    this.name = data.name;
    this.imageUrl = data.imageUrl;
    this.gridConfig = data.gridConfig;
    this.campaignId = data.campaignId;
  }
}
