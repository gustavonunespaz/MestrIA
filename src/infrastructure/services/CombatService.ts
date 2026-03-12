import { prisma } from '@infrastructure/prisma/client';
import { DiceRoller } from '@shared/utils/DiceRoller';
import { ChatService } from '@infrastructure/socket/ChatService';
import { StringUtils, DateUtils } from '@shared/utils';

export interface CombatParticipant {
  id: string;
  characterId: string;
  name: string;
  hpCurrent: number;
  hpMax: number;
  armorClass: number;
  initiativeResult: number;
  dexterityModifier: number;
  isPlayerCharacter: boolean;
}

export interface CombatTurn {
  roundNumber: number;
  currentTurnParticipantId: string;
  action: string;
  result: any;
}

export class CombatService {
  private chatService: ChatService;
  private activeCombats: Map<string, CombatEncounter> = new Map();

  constructor(chatService: ChatService) {
    this.chatService = chatService;
  }

  /**
   * Iniciar um encontro de combate
   */
  async startEncounter(
    campaignId: string,
    encounterId: string,
    playerCharacterIds: string[],
    monsterIds: string[],
  ): Promise<CombatEncounter> {
    const key = `${campaignId}:${encounterId}`;

    // Buscar personagens
    const players = await prisma.character.findMany({
      where: { id: { in: playerCharacterIds } },
    });

    // Buscar monstros
    const monsters = await prisma.monster.findMany({
      where: { id: { in: monsterIds } },
    });

    // Preparar participantes
    const participants: CombatParticipant[] = [];

    // Adicionar jogadores
    for (const player of players) {
      const attributes = player.attributes as any;
      const dexterityModifier = DiceRoller.getAttributeModifier(attributes?.dexterity || 10);

      participants.push({
        id: StringUtils.generateId(),
        characterId: player.id,
        name: player.name,
        hpCurrent: player.hpCurrent,
        hpMax: player.hpMax,
        armorClass: 10 + dexterityModifier, // AC simples
        initiativeResult: 0,
        dexterityModifier,
        isPlayerCharacter: true,
      });
    }

    // Adicionar monstros
    for (const monster of monsters) {
      participants.push({
        id: StringUtils.generateId(),
        characterId: monster.id,
        name: monster.name,
        hpCurrent: monster.hpCurrent || monster.hpMax,
        hpMax: monster.hpMax,
        armorClass: monster.armorClass || 10,
        initiativeResult: 0,
        dexterityModifier: 0,
        isPlayerCharacter: false,
      });
    }

    // Rolar iniciativa
    for (const participant of participants) {
      const initiativeRoll = DiceRoller.roll('d20', {});
      participant.initiativeResult = initiativeRoll.total + participant.dexterityModifier;
    }

    // Ordenar por iniciativa (decrescente)
    participants.sort((a, b) => b.initiativeResult - a.initiativeResult);

    const encounter = new CombatEncounter(campaignId, encounterId, participants, this.chatService);
    this.activeCombats.set(key, encounter);

    // Notificar começou
    await this.chatService.sendSystemMessage(
      campaignId,
      `⚔️ **COMBATE INICIADO!** Ordem de iniciativa:\n${participants
        .map((p, i) => `${i + 1}. ${p.name} (${p.initiativeResult})`)
        .join('\n')}`,
    );

    return encounter;
  }

  /**
   * Obter combate ativo
   */
  getActiveCombat(campaignId: string, encounterId: string): CombatEncounter | undefined {
    return this.activeCombats.get(`${campaignId}:${encounterId}`);
  }

  /**
   * Terminar combate
   */
  async endEncounter(campaignId: string, encounterId: string): Promise<void> {
    const key = `${campaignId}:${encounterId}`;
    const encounter = this.activeCombats.get(key);

    if (!encounter) {
      throw new Error('Combate não encontrado');
    }

    const victor = encounter.getVictor();
    await this.chatService.sendSystemMessage(
      campaignId,
      `⚔️ **COMBATE FINALIZADO!**\n🏆 Vitória: ${victor?.name || 'Ninguém'}`,
    );

    this.activeCombats.delete(key);
  }

  /**
   * Registrar ação em combate
   */
  async takeAction(
    campaignId: string,
    encounterId: string,
    participantId: string,
    action: 'attack' | 'spell' | 'move' | 'dodge' | 'help',
    targetId?: string,
    spellName?: string,
  ): Promise<any> {
    const encounter = this.getActiveCombat(campaignId, encounterId);
    if (!encounter) {
      throw new Error('Combate não encontrado');
    }

    const participant = encounter.getParticipant(participantId);
    const target = targetId ? encounter.getParticipant(targetId) : null;

    if (!participant) {
      throw new Error('Participante não encontrado');
    }

    let result: any;

    switch (action) {
      case 'attack':
        if (!target) throw new Error('Alvo necessário para ataque');
        result = await this.resolveAttack(encounter, participant, target);
        break;

      case 'spell':
        if (!target) throw new Error('Alvo necessário para feitiço');
        if (!spellName) throw new Error('Nome do feitiço necessário');
        result = await this.resolveSpell(encounter, participant, target, spellName);
        break;

      case 'dodge':
        result = await this.resolveDodge(encounter, participant);
        break;

      case 'move':
        result = { success: true, message: `${participant.name} se move em combate` };
        break;

      case 'help':
        if (!target) throw new Error('Alvo necessário para ajudar');
        result = { success: true, message: `${participant.name} ajuda ${target.name}` };
        break;

      default:
        throw new Error('Ação desconhecida');
    }

    // Registrar no banco
    await prisma.combatLog.create({
      data: {
        id: StringUtils.generateId(),
        encounterId,
        participantId,
        action,
        result: JSON.stringify(result),
      },
    });

    // Notificar na campanha
    await this.chatService.sendSystemMessage(campaignId, `⚔️ ${result.message || 'Ação executada'}`);

    return result;
  }

  private async resolveAttack(
    encounter: CombatEncounter,
    attacker: CombatParticipant,
    defender: CombatParticipant,
  ): Promise<any> {
    const attackRoll = DiceRoller.attackRoll(2); // +2 bônus de ataque simples
    const hit = attackRoll.total >= defender.armorClass;

    if (!hit) {
      return {
        type: 'attack',
        success: false,
        message: `${attacker.name} ataca ${defender.name} e **erra**! (${attackRoll.total} vs CA ${defender.armorClass})`,
        attackRoll: attackRoll.total,
      };
    }

    const damageRoll = DiceRoller.damageRoll('1d8', 2);
    const newHp = Math.max(0, defender.hpCurrent - damageRoll.total);
    defender.hpCurrent = newHp;

    const message =
      newHp <= 0
        ? `${attacker.name} ataca ${defender.name} e **acerta CRITICAMENTE**! ${damageRoll.total} de dano. ${defender.name} foi **derrotado**!`
        : `${attacker.name} ataca ${defender.name} e **acerta**! ${damageRoll.total} de dano. (${newHp}/${defender.hpMax} HP)`;

    return {
      type: 'attack',
      success: true,
      isCritical: attackRoll.isNatural20,
      message,
      attackRoll: attackRoll.total,
      damageRoll: damageRoll.total,
      hpRemaining: newHp,
    };
  }

  private async resolveSpell(
    encounter: CombatEncounter,
    caster: CombatParticipant,
    target: CombatParticipant,
    spellName: string,
  ): Promise<any> {
    // Buscar feitiço
    const spell = await prisma.spell.findFirst({
      where: { name: spellName },
    });

    if (!spell) {
      return {
        type: 'spell',
        success: false,
        message: `${caster.name} tenta lançar "${spellName}" mas o feitiço não existe!`,
      };
    }

    const spellAttackRoll = DiceRoller.attackRoll(1);
    const hit = spellAttackRoll.total >= target.armorClass;

    if (!hit) {
      return {
        type: 'spell',
        success: false,
        message: `${caster.name} lança ${spellName} mas ${target.name} se esquiva! (${spellAttackRoll.total} vs CA ${target.armorClass})`,
      };
    }

    // Dano baseado no nível do feitiço
    const damageDice = `${spell.level}d6`;
    const damageRoll = DiceRoller.damageRoll(damageDice, spell.level);
    const newHp = Math.max(0, target.hpCurrent - damageRoll.total);
    target.hpCurrent = newHp;

    return {
      type: 'spell',
      success: true,
      message: `${caster.name} lança **${spellName}** em ${target.name}! ${damageRoll.total} de dano (${newHp}/${target.hpMax} HP)`,
      damageRoll: damageRoll.total,
      hpRemaining: newHp,
    };
  }

  private async resolveDodge(encounter: CombatEncounter, dodger: CombatParticipant): Promise<any> {
    return {
      type: 'dodge',
      success: true,
      message: `${dodger.name} se coloca em posição defensiva. AC aumentado em +2 até o próximo turno.`,
    };
  }
}

class CombatEncounter {
  private campaignId: string;
  private encounterId: string;
  private participants: CombatParticipant[];
  private currentTurnIndex: number = 0;
  private roundNumber: number = 1;
  private chatService: ChatService;

  constructor(campaignId: string, encounterId: string, participants: CombatParticipant[], chatService: ChatService) {
    this.campaignId = campaignId;
    this.encounterId = encounterId;
    this.participants = participants;
    this.chatService = chatService;
  }

  getCurrentTurn(): CombatParticipant {
    return this.participants[this.currentTurnIndex];
  }

  nextTurn(): void {
    this.currentTurnIndex = (this.currentTurnIndex + 1) % this.participants.length;
    if (this.currentTurnIndex === 0) {
      this.roundNumber++;
    }
  }

  getParticipant(id: string): CombatParticipant | undefined {
    return this.participants.find((p) => p.id === id);
  }

  getVictor(): CombatParticipant | undefined {
    const alivePlayers = this.participants.filter((p) => p.hpCurrent > 0 && p.isPlayerCharacter);
    const aliveMonsters = this.participants.filter((p) => p.hpCurrent > 0 && !p.isPlayerCharacter);

    if (aliveMonsters.length === 0) {
      return alivePlayers[0];
    }
    if (alivePlayers.length === 0) {
      return aliveMonsters[0];
    }
    return undefined;
  }

  getAllParticipants(): CombatParticipant[] {
    return this.participants;
  }

  getRound(): number {
    return this.roundNumber;
  }
}
