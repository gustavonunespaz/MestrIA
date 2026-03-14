import { ICampaignRepository } from '@domain/repositories/ICampaignRepository';
import { Campaign } from '@domain/entities/Campaign';
import { prisma } from '@infrastructure/prisma/client';

export class CampaignRepository implements ICampaignRepository {
  async findById(id: string): Promise<Campaign | null> {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });

    if (!campaign) {
      return null;
    }

    return new Campaign({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      systemBase: campaign.systemBase,
      dmType: campaign.dmType as 'AI' | 'HUMAN',
      creatorId: campaign.creatorId,
      inviteCode: campaign.inviteCode,
      membersCount: campaign._count?.members ?? 0,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    });
  }

  async findByCampaignCode(inviteCode: string): Promise<Campaign | null> {
    const campaign = await prisma.campaign.findUnique({
      where: { inviteCode },
      include: { _count: { select: { members: true } } },
    });

    if (!campaign) {
      return null;
    }

    return new Campaign({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      systemBase: campaign.systemBase,
      dmType: campaign.dmType as 'AI' | 'HUMAN',
      creatorId: campaign.creatorId,
      inviteCode: campaign.inviteCode,
      membersCount: campaign._count?.members ?? 0,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    });
  }

  async create(campaign: Campaign): Promise<Campaign> {
    const created = await prisma.campaign.create({
      data: {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        systemBase: campaign.systemBase,
        dmType: campaign.dmType,
        creatorId: campaign.creatorId,
        inviteCode: campaign.inviteCode,
        members: {
          create: {
            userId: campaign.creatorId,
          },
        },
      },
      include: { _count: { select: { members: true } } },
    });

    return new Campaign({
      id: created.id,
      title: created.title,
      description: created.description,
      systemBase: created.systemBase,
      dmType: created.dmType as 'AI' | 'HUMAN',
      creatorId: created.creatorId,
      inviteCode: created.inviteCode,
      membersCount: created._count?.members ?? 0,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }

  async update(campaign: Campaign): Promise<Campaign> {
    const updated = await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        title: campaign.title,
        description: campaign.description,
        systemBase: campaign.systemBase,
      },
      include: { _count: { select: { members: true } } },
    });

    return new Campaign({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      systemBase: updated.systemBase,
      dmType: updated.dmType as 'AI' | 'HUMAN',
      creatorId: updated.creatorId,
      inviteCode: updated.inviteCode,
      membersCount: updated._count?.members ?? 0,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<boolean> {
    await prisma.campaign.delete({
      where: { id },
    });
    return true;
  }

  async findByCreatorId(creatorId: string): Promise<Campaign[]> {
    const campaigns = await prisma.campaign.findMany({
      where: { creatorId },
      include: { _count: { select: { members: true } } },
    });

    return campaigns.map(
      (campaign: any) =>
        new Campaign({
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          systemBase: campaign.systemBase,
          dmType: campaign.dmType as 'AI' | 'HUMAN',
          creatorId: campaign.creatorId,
          inviteCode: campaign.inviteCode,
          membersCount: campaign._count?.members ?? 0,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        }),
    );
  }

  async findByUserId(userId: string): Promise<Campaign[]> {
    const campaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: { _count: { select: { members: true } } },
    });

    return campaigns.map(
      (campaign: any) =>
        new Campaign({
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          systemBase: campaign.systemBase,
          dmType: campaign.dmType as 'AI' | 'HUMAN',
          creatorId: campaign.creatorId,
          inviteCode: campaign.inviteCode,
          membersCount: campaign._count?.members ?? 0,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        }),
    );
  }

  async addMember(campaignId: string, userId: string): Promise<void> {
    await prisma.campaignMember.upsert({
      where: { userId_campaignId: { userId, campaignId } },
      create: { userId, campaignId },
      update: {},
    });
  }
}
