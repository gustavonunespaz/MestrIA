import { IMapRepository } from '@domain/repositories/IMapRepository';
import { Map } from '@domain/entities/Map';
import { prisma } from '@infrastructure/prisma/client';

export class MapRepository implements IMapRepository {
  async findByCampaignId(campaignId: string): Promise<Map | null> {
    const map = await prisma.map.findFirst({
      where: { campaignId },
    });

    if (!map) return null;

    return new Map({
      id: map.id,
      name: map.name,
      imageUrl: map.imageUrl,
      gridConfig: map.gridConfig as any,
      campaignId: map.campaignId,
    });
  }

  async create(map: Map): Promise<Map> {
    const created = await prisma.map.create({
      data: {
        id: map.id,
        name: map.name,
        imageUrl: map.imageUrl,
        gridConfig: map.gridConfig,
        campaignId: map.campaignId,
      },
    });

    return new Map({
      id: created.id,
      name: created.name,
      imageUrl: created.imageUrl,
      gridConfig: created.gridConfig as any,
      campaignId: created.campaignId,
    });
  }

  async update(map: Map): Promise<Map> {
    const updated = await prisma.map.update({
      where: { id: map.id },
      data: {
        name: map.name,
        imageUrl: map.imageUrl,
        gridConfig: map.gridConfig,
      },
    });

    return new Map({
      id: updated.id,
      name: updated.name,
      imageUrl: updated.imageUrl,
      gridConfig: updated.gridConfig as any,
      campaignId: updated.campaignId,
    });
  }
}
