import { prisma } from '@infrastructure/prisma/client';
import { Race } from '@domain/entities/Race';
import { IRaceRepository } from '@domain/repositories/IRaceRepository';

export class RaceRepository implements IRaceRepository {
  async findAll(): Promise<Race[]> {
    const races = await prisma.race.findMany();
    return races.map((race: any) => this.mapToDomain(race));
  }

  async findById(id: string): Promise<Race | null> {
    const race = await prisma.race.findUnique({
      where: { id },
    });
    return race ? this.mapToDomain(race) : null;
  }

  async create(race: Race): Promise<Race> {
    const created = await prisma.race.create({
      data: {
        name: race.name,
        description: race.description,
        traits: race.traits,
      },
    });
    return this.mapToDomain(created);
  }

  async update(race: Race): Promise<Race> {
    const updated = await prisma.race.update({
      where: { id: race.id },
      data: {
        name: race.name,
        description: race.description,
        traits: race.traits,
      },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.race.delete({
      where: { id },
    });
  }

  private mapToDomain(raw: any): Race {
    return new Race({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      traits: raw.traits || {},
    });
  }
}
