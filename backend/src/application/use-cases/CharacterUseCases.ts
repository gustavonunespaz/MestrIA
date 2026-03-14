import { ICharacterRepository } from '@domain/repositories/ICharacterRepository';
import { Character } from '@domain/entities/Character';
import {
  CreateCharacterDTO,
  UpdateCharacterDTO,
  CharacterResponseDTO,
} from '@application/dto/CharacterDTO';
import { StringUtils, DateUtils } from '@shared/utils';
import { ValidationError, NotFoundError } from '@shared/errors/AppError';

export class CreateCharacterUseCase {
  constructor(private characterRepository: ICharacterRepository) {}

  async execute(userId: string, dto: CreateCharacterDTO): Promise<CharacterResponseDTO> {
    // Validação
    if (!dto.name || dto.name.length < 2) {
      throw new ValidationError('O nome deve ter pelo menos 2 caracteres');
    }

    if (dto.level < 1 || dto.level > 20) {
      throw new ValidationError('O nível deve estar entre 1 e 20');
    }

    // Criar entidade
    const character = new Character({
      id: StringUtils.generateId(),
      name: dto.name,
      level: dto.level,
      hpCurrent: dto.hpCurrent,
      hpMax: dto.hpMax,
      isBot: dto['isBot'] || false,
      botType: dto['botType'],
      avatarUrl: dto['avatarUrl'],
      userId,
      campaignId: dto.campaignId,
      raceId: dto.raceId,
      classId: dto.classId,
      attributes: dto.attributes,
      createdAt: DateUtils.now(),
      updatedAt: DateUtils.now(),
    });

    // Persistir
    const created = await this.characterRepository.create(character);

    return new CharacterResponseDTO({
      id: created.id,
      name: created.name,
      level: created.level,
      hpCurrent: created.hpCurrent,
      hpMax: created.hpMax,
      isBot: created.isBot,
      botType: created.botType,
      avatarUrl: created.avatarUrl,
      userId: created.userId,
      campaignId: created.campaignId,
      raceId: created.raceId,
      classId: created.classId,
      attributes: created.attributes,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }
}

export class GetCharacterByIdUseCase {
  constructor(private characterRepository: ICharacterRepository) {}

  async execute(id: string): Promise<CharacterResponseDTO> {
    const character = await this.characterRepository.findById(id);

    if (!character) {
      throw new NotFoundError('Personagem');
    }

    return new CharacterResponseDTO({
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
      attributes: character.attributes,
      createdAt: character.createdAt,
      updatedAt: character.updatedAt,
    });
  }
}

export class UpdateCharacterUseCase {
  constructor(private characterRepository: ICharacterRepository) {}

  async execute(id: string, dto: UpdateCharacterDTO): Promise<CharacterResponseDTO> {
    const character = await this.characterRepository.findById(id);

    if (!character) {
      throw new NotFoundError('Personagem');
    }

    // Atualizar campos
    if (dto.name) character.name = dto.name;
    if (dto.level) character.level = dto.level;
    if (dto.hpCurrent !== undefined) character.hpCurrent = dto.hpCurrent;
    if (dto.hpMax) character.hpMax = dto.hpMax;
    if (dto.avatarUrl !== undefined) character.avatarUrl = dto.avatarUrl;
    if (dto.attributes) {
      character.attributes = {
        ...character.attributes,
        ...dto.attributes,
      };
    }
    character.updatedAt = DateUtils.now();

    const updated = await this.characterRepository.update(character);

    return new CharacterResponseDTO({
      id: updated.id,
      name: updated.name,
      level: updated.level,
      hpCurrent: updated.hpCurrent,
      hpMax: updated.hpMax,
      isBot: updated.isBot,
      botType: updated.botType,
      avatarUrl: updated.avatarUrl,
      userId: updated.userId,
      campaignId: updated.campaignId,
      raceId: updated.raceId,
      classId: updated.classId,
      attributes: updated.attributes,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }
}

export class DeleteCharacterUseCase {
  constructor(private characterRepository: ICharacterRepository) {}

  async execute(id: string): Promise<void> {
    const character = await this.characterRepository.findById(id);

    if (!character) {
      throw new NotFoundError('Personagem');
    }

    await this.characterRepository.delete(id);
  }
}

export class ListCharactersByCampaignUseCase {
  constructor(private characterRepository: ICharacterRepository) {}

  async execute(campaignId: string): Promise<CharacterResponseDTO[]> {
    const characters = await this.characterRepository.findByCampaignId(campaignId);

    return characters.map(
      (character) =>
        new CharacterResponseDTO({
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
          attributes: character.attributes,
          createdAt: character.createdAt,
          updatedAt: character.updatedAt,
        }),
    );
  }
}

export class ListCharactersByUserUseCase {
  constructor(private characterRepository: ICharacterRepository) {}

  async execute(userId: string): Promise<CharacterResponseDTO[]> {
    const characters = await this.characterRepository.findByUserId(userId);

    return characters.map(
      (character) =>
        new CharacterResponseDTO({
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
          attributes: character.attributes,
          createdAt: character.createdAt,
          updatedAt: character.updatedAt,
        }),
    );
  }
}
