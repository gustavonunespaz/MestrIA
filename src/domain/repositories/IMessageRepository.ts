import { Message } from '../entities/Message';

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  findByCampaignId(campaignId: string, limit?: number): Promise<Message[]>;
  create(message: Message): Promise<Message>;
  delete(id: string): Promise<void>;
  deleteByCampaignId(campaignId: string): Promise<void>;
}
