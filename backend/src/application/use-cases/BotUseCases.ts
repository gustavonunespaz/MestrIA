import { ICharacterRepository } from '@domain/repositories/ICharacterRepository';
import { IRaceRepository } from '@domain/repositories/IRaceRepository';
import { IClassRepository } from '@domain/repositories/IClassRepository';
import { Character } from '@domain/entities/Character';
import { StringUtils, DateUtils } from '@shared/utils';
import { ValidationError } from '@shared/errors/AppError';
import { CharacterResponseDTO } from '@application/dto/CharacterDTO';

export interface BotOptions {
  raceId?: string;
  classId?: string;
}

export class CreateBotsUseCase {
  constructor(
    private characterRepository: ICharacterRepository,
    private raceRepository: IRaceRepository,
    private classRepository: IClassRepository,
  ) {}

  /**
   * Cria até `count` bots para uma campanha. Os bots são personagens com `isBot` verdadeiro.
   * `options` pode trazer raça e classe fixas; caso contrário serão escolhidas aleatoriamente.
   */
  async execute(
    campaignId: string,
    playerId: string,
    count: number,
    options: BotOptions = {},
  ): Promise<CharacterResponseDTO[]> {
    if (count < 1 || count > 3) {
      throw new ValidationError('Você pode criar entre 1 e 3 bots');
    }

    // pré-carregar valores caso necessário
    let chosenRaceId = options.raceId;
    let chosenClassId = options.classId;

    if (!chosenRaceId) {
      const races = await this.raceRepository.findAll();
      if (races.length > 0) {
        chosenRaceId = races[0].id;
      }
    }

    if (!chosenClassId) {
      const classes = await this.classRepository.findAll();
      if (classes.length > 0) {
        chosenClassId = classes[0].id;
      }
    }

    const bots: CharacterResponseDTO[] = [];

    for (let i = 0; i < count; i++) {
      const botName = `AI Bot #${i + 1}`;
      const bot: Character = new Character({
        id: StringUtils.generateId(),
        name: botName,
        level: 1,
        hpCurrent: 10,
        hpMax: 10,
        isBot: true,
        botType: 'DEFAULT',
        userId: playerId,
        campaignId,
        raceId: chosenRaceId || '',
        classId: chosenClassId || '',
        attributes: {
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
        },
        createdAt: DateUtils.now(),
        updatedAt: DateUtils.now(),
      });

      const created = await this.characterRepository.create(bot);

      bots.push(
        new CharacterResponseDTO({
          id: created.id,
          name: created.name,
          level: created.level,
          hpCurrent: created.hpCurrent,
          hpMax: created.hpMax,
          isBot: created.isBot,
          botType: created.botType,
          userId: created.userId,
          campaignId: created.campaignId,
          raceId: created.raceId,
          classId: created.classId,
          attributes: created.attributes,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        }),
      );
    }

    return bots;
  }
}

export class DeleteBotsByCampaignUseCase {
  constructor(private characterRepository: ICharacterRepository) {}

  async execute(campaignId: string): Promise<void> {
    await this.characterRepository.deleteBotsByCampaignId(campaignId);
  }
}
