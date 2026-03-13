import { prisma } from '@infrastructure/prisma/client';
import { Class } from '@domain/entities/Class';
import { IClassRepository } from '@domain/repositories/IClassRepository';

export class ClassRepository implements IClassRepository {
  async findAll(): Promise<Class[]> {
    const classes = await prisma.class.findMany();
    return classes.map((cls: any) => this.mapToDomain(cls));
  }

  async findById(id: string): Promise<Class | null> {
    const cls = await prisma.class.findUnique({
      where: { id },
    });
    return cls ? this.mapToDomain(cls) : null;
  }

  async create(classEntity: Class): Promise<Class> {
    const created = await prisma.class.create({
      data: {
        name: classEntity.name,
        description: classEntity.description,
        hitDice: classEntity.hitDice,
      },
    });
    return this.mapToDomain(created);
  }

  async update(classEntity: Class): Promise<Class> {
    const updated = await prisma.class.update({
      where: { id: classEntity.id },
      data: {
        name: classEntity.name,
        description: classEntity.description,
        hitDice: classEntity.hitDice,
      },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.class.delete({
      where: { id },
    });
  }

  private mapToDomain(raw: any): Class {
    return new Class({
      id: raw.id,
      name: raw.name,
      description: raw.description,
      hitDice: raw.hitDice,
    });
  }
}
