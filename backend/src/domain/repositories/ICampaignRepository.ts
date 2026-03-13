import { Campaign } from '@domain/entities/Campaign';

export interface ICampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  findByCampaignCode(inviteCode: string): Promise<Campaign | null>;
  create(campaign: Campaign): Promise<Campaign>;
  update(campaign: Campaign): Promise<Campaign>;
  delete(id: string): Promise<boolean>;
  findByCreatorId(creatorId: string): Promise<Campaign[]>;
}
