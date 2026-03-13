import { prisma } from '@infrastructure/prisma/client';

export interface CampaignContextData {
  campaignTitle: string;
  systemBase: string;
  dmType: string;
  description: string;
  currentSessionTitle?: string | null;
  playersCount: number;
}

export interface CharacterContextData {
  characterName: string;
  level: number;
  race: string;
  class: string;
  hpCurrent: number;
  hpMax: number;
  attributes: Record<string, number>;
  spells: string[];
  items: string[];
  isAlive: boolean;
}

export class ContextManagerService {
  async getCampaignContext(campaignId: string): Promise<CampaignContextData> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const currentSession = await prisma.session.findFirst({
      where: {
        campaignId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      campaignTitle: campaign.title,
      systemBase: campaign.systemBase,
      dmType: campaign.dmType,
      description: campaign.description || 'No description',
      currentSessionTitle: currentSession?.title,
      playersCount: campaign._count.members,
    };
  }

  async getCharacterContext(characterId: string): Promise<CharacterContextData> {
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      include: {
        race: true,
        class: true,
        spells: {
          include: {
            spell: true,
          },
        },
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    return {
      characterName: character.name,
      level: character.level,
      race: character.race.name,
      class: character.class.name,
      hpCurrent: character.hpCurrent,
      hpMax: character.hpMax,
      attributes: character.attributes as Record<string, number>,
      spells: character.spells.map((cs: any) => cs.spell.name),
      items: character.items.map((ci: any) => ci.item.name),
      isAlive: character.isAlive,
    };
  }

  async getRecentMessages(
    campaignId: string,
    limit: number = 10,
  ): Promise<Array<{ role: string; content: string }>> {
    const messages = await prisma.message.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return messages.reverse().map((msg: any) => ({
      role: msg.senderRole || 'user',
      content: msg.content,
    }));
  }

  async buildSystemPrompt(campaignId: string): Promise<string> {
    const context = await this.getCampaignContext(campaignId);

    return `You are an expert Dungeon Master for ${context.systemBase}. 

Campaign: "${context.campaignTitle}"
${context.description}

You have ${context.playersCount} players in this campaign.

Your responsibilities:
1. Create immersive, engaging narratives
2. Describe scenes vividly and bring NPCs to life
3. Make fair and consistent rulings based on the game system
4. Manage combat encounters and monster actions
5. Reward creative solutions and roleplay
6. Maintain narrative continuity and consistency

Always stay in character and remember the context. Be dramatic, mysterious, and engaging. 
Respond as the Dungeon Master would, describing what the players experience.`;
  }

  async recordCampaignSummary(
    campaignId: string,
    summary: string,
  ): Promise<void> {
    const messages = await prisma.message.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const messageSummary = messages
      .reverse()
      .map((m: any) => `${m.senderRole}: ${m.content}`)
      .join('\n');

    console.log(
      `[Context Manager] Campaign ${campaignId} context snapshot recorded`,
    );
    console.log(`Summary: ${summary}`);
    console.log(`Recent messages snapshot: ${messageSummary.substring(0, 500)}...`);
  }
}

export const contextManagerService = new ContextManagerService();
