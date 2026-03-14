import { Map } from '@domain/entities/Map';

export interface IMapRepository {
  findByCampaignId(campaignId: string): Promise<Map | null>;
  create(map: Map): Promise<Map>;
  update(map: Map): Promise<Map>;
}
