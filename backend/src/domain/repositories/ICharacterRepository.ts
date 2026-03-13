import { Character } from '@domain/entities/Character';

export interface ICharacterRepository {
  findById(id: string): Promise<Character | null>;
  create(character: Character): Promise<Character>;
  update(character: Character): Promise<Character>;
  delete(id: string): Promise<boolean>;
  findByCampaignId(campaignId: string): Promise<Character[]>;
  findByUserId(userId: string): Promise<Character[]>;
  findBotsByCampaignId(campaignId: string): Promise<Character[]>;
  deleteBotsByCampaignId(campaignId: string): Promise<void>;
}
