import { Class } from '../entities/Class';

export interface IClassRepository {
  findAll(): Promise<Class[]>;
  findById(id: string): Promise<Class | null>;
  create(classEntity: Class): Promise<Class>;
  update(classEntity: Class): Promise<Class>;
  delete(id: string): Promise<void>;
}
