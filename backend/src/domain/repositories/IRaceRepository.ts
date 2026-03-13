import { Race } from '../entities/Race';

export interface IRaceRepository {
  findAll(): Promise<Race[]>;
  findById(id: string): Promise<Race | null>;
  create(race: Race): Promise<Race>;
  update(race: Race): Promise<Race>;
  delete(id: string): Promise<void>;
}
