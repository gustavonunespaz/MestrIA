/**
 * Dice Roller - Sistema de rolagem de dados para D&D
 *
 * Suporta:
 * - Múltiplos dados: 2d20, 3d6, etc.
 * - Modificadores: 1d20+5, 2d8-2
 * - Advantage/Disadvantage: roll('d20', { advantage: true })
 * - Críticos: Detecta automaticamente 20 natural em d20
 */

export interface DiceRoll {
  dice: string;
  rolls: number[];
  modifier: number;
  total: number;
  isNatural20: boolean;
  isNatural1: boolean;
  advantage?: boolean;
  disadvantage?: boolean;
  description: string;
}

export class DiceRoller {
  /**
   * Rolar um dado simples
   * Exemplos: roll('d20'), roll('d12+3'), roll('2d6-1')
   */
  static roll(diceExpression: string, options?: { advantage?: boolean; disadvantage?: boolean }): DiceRoll {
    // Parse da expressão
    const match = diceExpression.match(/^(\d+)?d(\d+)(([+-])(\d+))?$/i);

    if (!match) {
      throw new Error(`Expressão de dado inválida: ${diceExpression}. Use formato: [n]d<tipo>[+/-modifier]`);
    }

    const numDice = parseInt(match[1] || '1', 10);
    const diceType = parseInt(match[2], 10);
    const modifierOperator = match[4] || '+';
    const modifierValue = parseInt(match[5] || '0', 10);
    const modifier = modifierOperator === '+' ? modifierValue : -modifierValue;

    // Validar valores
    if (numDice < 1 || numDice > 100) {
      throw new Error('Número de dados deve estar entre 1 e 100');
    }
    if (![4, 6, 8, 10, 12, 20, 100].includes(diceType)) {
      throw new Error(`Tipo de dado inválido: d${diceType}. Use: d4, d6, d8, d10, d12, d20`);
    }

    // Rolagem
    const rolls = this.rollDice(numDice, diceType);
    let selectedRolls = rolls;

    // Advantage/Disadvantage (apenas para d20, primeiro dado)
    if ((options?.advantage || options?.disadvantage) && diceType === 20 && numDice === 1) {
      const secondRoll = this.rollDice(1, 20)[0];
      rolls.push(secondRoll);

      if (options.advantage) {
        selectedRolls = [Math.max(rolls[0], rolls[1])];
      } else {
        selectedRolls = [Math.min(rolls[0], rolls[1])];
      }
    }

    const subTotal = selectedRolls.reduce((a, b) => a + b, 0);
    const total = subTotal + modifier;
    const isNatural20 = diceType === 20 && selectedRolls[0] === 20;
    const isNatural1 = diceType === 20 && selectedRolls[0] === 1;

    const advantage = options?.advantage;
    const disadvantage = options?.disadvantage;

    return {
      dice: diceExpression,
      rolls,
      modifier,
      total,
      isNatural20,
      isNatural1,
      advantage,
      disadvantage,
      description: this.buildDescription(numDice, diceType, rolls, selectedRolls, modifier, advantage, disadvantage),
    };
  }

  /**
   * Calcular modificador de atributo D&D
   * 10-11 = +0, 12-13 = +1, 14-15 = +2, etc.
   */
  static getAttributeModifier(attributeValue: number): number {
    return Math.floor((attributeValue - 10) / 2);
  }

  /**
   * Rolagem de ataque completa com modificador
   */
  static attackRoll(attackBonus: number): DiceRoll {
    const result = this.roll('d20');
    result.modifier += attackBonus;
    result.total += attackBonus;
    result.description = `Ataque: [${result.rolls[0]}] + ${attackBonus} = ${result.total}${result.isNatural20 ? ' 🎉 CRÍTICO!' : result.isNatural1 ? ' ☠️ Falha crítica!' : ''}`;
    return result;
  }

  /**
   * Rolagem de dano
   */
  static damageRoll(diceExpression: string, damageBonus: number = 0): DiceRoll {
    const result = this.roll(diceExpression);
    result.modifier += damageBonus;
    result.total += damageBonus;
    return result;
  }

  /**
   * Teste de habilidade
   */
  static abilityCheck(attributeModifier: number, proficiencyBonus: number = 0): DiceRoll {
    const result = this.roll('d20');
    const bonus = attributeModifier + proficiencyBonus;
    result.modifier = bonus;
    result.total = result.rolls[0] + bonus;
    return result;
  }

  /**
   * Rolagem de resistência (Save)
   */
  static savingThrow(attributeModifier: number, proficiencyBonus: number = 0): DiceRoll {
    return this.abilityCheck(attributeModifier, proficiencyBonus);
  }

  /**
   * Rolar múltipla e contar sucessos (ex: 4d6 contra DC 10)
   */
  static rollMultipleWithThreshold(numRolls: number, diceType: number, threshold: number): {
    rolls: number[];
    successes: number;
    failures: number;
    total: number;
  } {
    const rolls = this.rollDice(numRolls, diceType);
    const successes = rolls.filter((r) => r >= threshold).length;
    const failures = rolls.length - successes;
    return {
      rolls,
      successes,
      failures,
      total: rolls.reduce((a, b) => a + b, 0),
    };
  }

  private static rollDice(numDice: number, diceType: number): number[] {
    const rolls: number[] = [];
    for (let i = 0; i < numDice; i++) {
      rolls.push(Math.floor(Math.random() * diceType) + 1);
    }
    return rolls;
  }

  private static buildDescription(
    numDice: number,
    diceType: number,
    allRolls: number[],
    selectedRolls: number[],
    modifier: number,
    advantage: boolean | undefined,
    disadvantage: boolean | undefined,
  ): string {
    let desc = `Rolagem: ${numDice}d${diceType}`;

    if (advantage) {
      desc += ` (Advantage: ${allRolls.join(', ')} → ${selectedRolls[0]})`;
    } else if (disadvantage) {
      desc += ` (Disadvantage: ${allRolls.join(', ')} → ${selectedRolls[0]})`;
    } else {
      desc += ` [${selectedRolls.join(', ')}]`;
    }

    if (modifier !== 0) {
      desc += ` ${modifier > 0 ? '+' : ''}${modifier}`;
    }

    desc += ` = ${selectedRolls.reduce((a, b) => a + b, 0) + modifier}`;

    return desc;
  }
}
