import { Session } from '../entities/Session';

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findByCampaignId(campaignId: string): Promise<Session[]>;
  create(session: Session): Promise<Session>;
  update(session: Session): Promise<Session>;
  delete(id: string): Promise<void>;
}
