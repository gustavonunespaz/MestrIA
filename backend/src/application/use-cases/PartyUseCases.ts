import { ICampaignRepository } from '@domain/repositories/ICampaignRepository';
import { ICharacterRepository } from '@domain/repositories/ICharacterRepository';
import { IMapRepository } from '@domain/repositories/IMapRepository';
import { ForbiddenError, NotFoundError } from '@shared/errors/AppError';

export class ResetPartyStateUseCase {
  constructor(
    private campaignRepository: ICampaignRepository,
    private characterRepository: ICharacterRepository,
    private mapRepository: IMapRepository,
  ) {}

  async execute(userId: string, campaignId: string): Promise<{ resetCharacters: number; mapReset: boolean }> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) {
      throw new NotFoundError('Campanha');
    }

    if (campaign.creatorId !== userId) {
      throw new ForbiddenError('Somente a Mestra pode resetar o estado da party');
    }

    const characters = await this.characterRepository.findByCampaignId(campaignId);
    await Promise.all(
      characters.map((character) => {
        character.hpCurrent = character.hpMax;
        character.isAlive = true;
        return this.characterRepository.update(character);
      }),
    );

    const map = await this.mapRepository.findByCampaignId(campaignId);
    if (!map) {
      return { resetCharacters: characters.length, mapReset: false };
    }

    map.gridConfig = {
      ...(map.gridConfig || {}),
      positions: {},
    };
    await this.mapRepository.update(map);

    return { resetCharacters: characters.length, mapReset: true };
  }
}
