import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { prisma } from '@infrastructure/prisma/client';

// Repository implementation - Infrastructure layer
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const data = await prisma.user.findUnique({
      where: { id },
    });

    if (!data) return null;

    return new User(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await prisma.user.findUnique({
      where: { email },
    });

    if (!data) return null;

    return new User(data);
  }

  async create(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

    return new User(created);
  }

  async update(user: User): Promise<User> {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        updatedAt: new Date(),
      },
    });

    return new User(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
