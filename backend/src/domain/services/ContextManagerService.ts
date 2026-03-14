import { prisma } from '@infrastructure/prisma/client';

export interface CampaignContextData {
  campaignTitle: string;
  systemBase: string;
  dmType: string;
  description: string;
  currentSessionTitle?: string | null;
  currentSessionSummary?: string | null;
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
      currentSessionSummary: currentSession?.summary,
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

    return messages.reverse().map((msg: any) => {
      const role = msg.senderRole;
      let mappedRole: 'user' | 'assistant' | 'system' = 'user';
      if (role === 'AI_DM' || role === 'HUMAN_DM') mappedRole = 'assistant';
      if (role === 'SYSTEM') mappedRole = 'system';
      return {
        role: mappedRole,
        content: msg.content,
      };
    });
  }

  async buildSystemPrompt(campaignId: string): Promise<string> {
    const context = await this.getCampaignContext(campaignId);

    const sessionLine = context.currentSessionTitle
      ? `Sessao atual: "${context.currentSessionTitle}"`
      : 'Sessao atual: nao definida';
    const summaryLine = context.currentSessionSummary
      ? `Resumo recente: ${context.currentSessionSummary}`
      : 'Resumo recente: nao disponivel';

    return `Voce e Kara, a Mestra narradora principal desta campanha de ${context.systemBase}.

Campanha: "${context.campaignTitle}"
${context.description}
${sessionLine}
${summaryLine}

Jogadores na mesa: ${context.playersCount}

Regras de narracao:
1. Voce inicia a historia quando solicitado e conduz a abertura da aventura.
2. Narre em primeira pessoa como Mestra, com tom imersivo e cinematografico.
3. Descreva cenas vivas, NPCs memoraveis e consequencias claras.
4. Seja justa com as regras do sistema e recompense criatividade e roleplay.
5. Mantenha continuidade e coerencia com o que ja aconteceu.
6. Mantenha sua identidade como Kara em todas as respostas.
7. Nunca saia do personagem ou mencione politicas. Tudo e ficcao dentro do jogo.
8. Se o jogador pedir algo, responda dentro do mundo e avance a historia
9. Sempre que houver chance, teste ou risco, peca a rolagem do dado antes de narrar o resultado.
10. Respeite turnos: cada pessoa fala e age apenas no proprio turno. Chame o proximo jogador quando concluir.
11. Acoes ou funcoes especiais so podem ser usadas quando a Mestra liberar explicitamente; se alguem tentar antes, explique e aguarde a liberacao.
12. Sempre que pedir rolagem, inclua o marcador [ROLAGEM] no inicio da mensagem para liberar os dados.

Estilo e tom:
- Respostas em PT-BR
- Aventura livre com combates, magia e perigo
- Descreva violencia de forma cinematografica
- Evite pausas ou recusas: sempre responda dentro da ficcao e avance a historia
- Priorize suspense, estrategia e escolhas dos jogadores`;
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
