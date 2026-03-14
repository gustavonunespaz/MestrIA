import { ICharacterRepository } from '@domain/repositories/ICharacterRepository';
import { Character } from '@domain/entities/Character';
import { prisma } from '@infrastructure/prisma/client';

export class CharacterRepository implements ICharacterRepository {
  async findById(id: string): Promise<Character | null> {
    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      return null;
    }

    return new Character({
      id: character.id,
      name: character.name,
      level: character.level,
      hpCurrent: character.hpCurrent,
      hpMax: character.hpMax,
      isBot: character.isBot,
      botType: character.botType,
      avatarUrl: character.avatarUrl,
      userId: character.userId,
      campaignId: character.campaignId,
      raceId: character.raceId,
      classId: character.classId,
      attributes: character.attributes as any,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
    });
  }

  async create(character: Character): Promise<Character> {
    const created = await prisma.character.create({
      data: {
        id: character.id,
        name: character.name,
        level: character.level,
        hpCurrent: character.hpCurrent,
        hpMax: character.hpMax,
        isBot: character.isBot === null ? undefined : character.isBot,
        botType: character.botType,
        avatarUrl: character.avatarUrl,
        userId: character.userId,
        campaignId: character.campaignId,
        raceId: character.raceId,
        classId: character.classId,
        attributes: character.attributes,
      },
    });

    return new Character({
      id: created.id,
      name: created.name,
      level: created.level,
      hpCurrent: created.hpCurrent,
      hpMax: created.hpMax,
      avatarUrl: created.avatarUrl,
      userId: created.userId,
      campaignId: created.campaignId,
      raceId: created.raceId,
      classId: created.classId,
      attributes: created.attributes as any,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async update(character: Character): Promise<Character> {
    const updated = await prisma.character.update({
      where: { id: character.id },
      data: {
        name: character.name,
        level: character.level,
        hpCurrent: character.hpCurrent,
        hpMax: character.hpMax,
        isBot: character.isBot === null ? undefined : character.isBot,
        botType: character.botType,
        avatarUrl: character.avatarUrl,
        attributes: character.attributes,
      },
    });

    return new Character({
      id: updated.id,
      name: updated.name,
      level: updated.level,
      hpCurrent: updated.hpCurrent,
      hpMax: updated.hpMax,
      avatarUrl: updated.avatarUrl,
      userId: updated.userId,
      campaignId: updated.campaignId,
      raceId: updated.raceId,
      classId: updated.classId,
      attributes: updated.attributes as any,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<boolean> {
    await prisma.character.delete({
      where: { id },
    });
    return true;
  }

  async findByCampaignId(campaignId: string): Promise<Character[]> {
    const characters = await prisma.character.findMany({
      where: { campaignId },
    });

    return characters.map(
      (character: any) =>
        new Character({
          id: character.id,
          name: character.name,
          level: character.level,
          hpCurrent: character.hpCurrent,
          hpMax: character.hpMax,
          avatarUrl: character.avatarUrl,
          userId: character.userId,
          campaignId: character.campaignId,
          raceId: character.raceId,
          classId: character.classId,
          attributes: character.attributes as any,
          createdAt: character.createdAt,
          updatedAt: character.updatedAt,
        }),
    );
  }

  async findByUserId(userId: string): Promise<Character[]> {
    const characters = await prisma.character.findMany({
      where: { userId },
    });

    return characters.map(
      (character: any) =>
        new Character({
          id: character.id,
          name: character.name,
          level: character.level,
          hpCurrent: character.hpCurrent,
          hpMax: character.hpMax,
          avatarUrl: character.avatarUrl,
          userId: character.userId,
          campaignId: character.campaignId,
          raceId: character.raceId,
          classId: character.classId,
          attributes: character.attributes as any,
          createdAt: character.createdAt,
          updatedAt: character.updatedAt,
        }),
    );
  }

  async findBotsByCampaignId(campaignId: string): Promise<Character[]> {
    const bots = await prisma.character.findMany({
      where: { campaignId, isBot: true },
    });

    return bots.map(
      (character: any) =>
        new Character({
          id: character.id,
          name: character.name,
          level: character.level,
          hpCurrent: character.hpCurrent,
          hpMax: character.hpMax,
          isBot: character.isBot,
          botType: character.botType,
          avatarUrl: character.avatarUrl,
          userId: character.userId,
          campaignId: character.campaignId,
          raceId: character.raceId,
          classId: character.classId,
          attributes: character.attributes as any,
          createdAt: character.createdAt,
          updatedAt: character.updatedAt,
        }),
    );
  }

  async deleteBotsByCampaignId(campaignId: string): Promise<void> {
    await prisma.character.deleteMany({
      where: { campaignId, isBot: true },
    });
  }
}
