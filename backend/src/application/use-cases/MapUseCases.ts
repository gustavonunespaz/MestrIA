import { IMapRepository } from '@domain/repositories/IMapRepository';
import { Map } from '@domain/entities/Map';
import { UpdateMapDTO, MapResponseDTO } from '@application/dto/MapDTO';
import { generateMap } from '@shared/utils/MapGenerator';
import { NotFoundError } from '@shared/errors/AppError';

export class GetMapByCampaignUseCase {
  constructor(private mapRepository: IMapRepository) {}

  async execute(campaignId: string): Promise<MapResponseDTO | null> {
    const map = await this.mapRepository.findByCampaignId(campaignId);
    if (!map) return null;

    return new MapResponseDTO({
      id: map.id,
      name: map.name,
      imageUrl: map.imageUrl,
      gridConfig: map.gridConfig,
      campaignId: map.campaignId,
    });
  }
}

export class GenerateMapUseCase {
  constructor(private mapRepository: IMapRepository) {}

  async execute(campaignId: string): Promise<MapResponseDTO> {
    const existing = await this.mapRepository.findByCampaignId(campaignId);
    const generated = generateMap(campaignId);

    if (existing) {
      const updated = await this.mapRepository.update(
        new Map({
          id: existing.id,
          name: generated.name,
          imageUrl: generated.imageUrl,
          gridConfig: generated.gridConfig,
          campaignId,
        }),
      );

      return new MapResponseDTO({
        id: updated.id,
        name: updated.name,
        imageUrl: updated.imageUrl,
        gridConfig: updated.gridConfig,
        campaignId: updated.campaignId,
      });
    }

    const created = await this.mapRepository.create(
      new Map({
        id: generated.id,
        name: generated.name,
        imageUrl: generated.imageUrl,
        gridConfig: generated.gridConfig,
        campaignId,
      }),
    );

    return new MapResponseDTO({
      id: created.id,
      name: created.name,
      imageUrl: created.imageUrl,
      gridConfig: created.gridConfig,
      campaignId: created.campaignId,
    });
  }
}

export class UpdateMapUseCase {
  constructor(private mapRepository: IMapRepository) {}

  async execute(campaignId: string, dto: UpdateMapDTO): Promise<MapResponseDTO> {
    const map = await this.mapRepository.findByCampaignId(campaignId);
    if (!map) {
      throw new NotFoundError('Mapa');
    }

    if (dto.name !== undefined) map.name = dto.name;
    if (dto.imageUrl !== undefined) map.imageUrl = dto.imageUrl;
    if (dto.gridConfig !== undefined) {
      map.gridConfig = {
        ...(map.gridConfig || {}),
        ...(dto.gridConfig || {}),
      };
    }

    const updated = await this.mapRepository.update(map);

    return new MapResponseDTO({
      id: updated.id,
      name: updated.name,
      imageUrl: updated.imageUrl,
      gridConfig: updated.gridConfig,
      campaignId: updated.campaignId,
    });
  }
}
