import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'crypto';
import { generateMap } from '../src/shared/utils/MapGenerator';

const prisma = new PrismaClient();

const avatarSvg = (label: string, color: string) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="${color}" />
  <circle cx="64" cy="64" r="42" fill="rgba(255,255,255,0.16)" />
  <text x="64" y="78" font-size="42" font-family="Arial" font-weight="700" text-anchor="middle" fill="#F8FAFC">${label}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

async function main() {
  console.log('Iniciando preenchimento do banco de dados...');

  await prisma.characterSpell.deleteMany();
  await prisma.characterItem.deleteMany();
  await prisma.playerCharacter.deleteMany();
  await prisma.monster.deleteMany();
  await prisma.character.deleteMany();
  await prisma.campaignMember.deleteMany();
  await prisma.combatEncounter.deleteMany();
  await prisma.message.deleteMany();
  await prisma.map.deleteMany();
  await prisma.session.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.spellTemplate.deleteMany();
  await prisma.itemTemplate.deleteMany();
  await prisma.monsterTemplate.deleteMany();
  await prisma.class.deleteMany();
  await prisma.race.deleteMany();

  console.log('Dados existentes removidos (exceto usuários)');

  const races = await Promise.all([
    prisma.race.create({
      data: {
        name: 'Humano de Asterion',
        description: 'Adaptáveis, curiosos e movidos por sonhos de grandeza.',
        traits: { abilityScoreIncrease: 'Todos +1', size: 'Médio', speed: 30, affinity: 'Versatilidade' },
      },
    }),
    prisma.race.create({
      data: {
        name: 'Elfo da Aurora',
        description: 'Elegantes e ancestrais, conectados aos ciclos da luz.',
        traits: { abilityScoreIncrease: 'Destreza +2', size: 'Médio', speed: 30, affinity: 'Visão no Escuro' },
      },
    }),
    prisma.race.create({
      data: {
        name: 'Anão do Ferro-Negro',
        description: 'Forjadores de lendas, resistentes como rocha viva.',
        traits: { abilityScoreIncrease: 'Constituição +2', size: 'Médio', speed: 25, affinity: 'Resiliência' },
      },
    }),
    prisma.race.create({
      data: {
        name: 'Tiefling Rubro',
        description: 'Marcados por pactos antigos, carregam fogo na alma.',
        traits: { abilityScoreIncrease: 'Carisma +2', size: 'Médio', speed: 30, affinity: 'Fogo Interior' },
      },
    }),
    prisma.race.create({
      data: {
        name: 'Halfling do Vento',
        description: 'Pequenos, velozes e mais corajosos do que parecem.',
        traits: { abilityScoreIncrease: 'Destreza +2', size: 'Pequeno', speed: 25, affinity: 'Sorte' },
      },
    }),
  ]);

  console.log(`${races.length} raças criadas`);

  const classes = await Promise.all([
    prisma.class.create({ data: { name: 'Bárbaro', description: 'Fúria ancestral e força imparável', hitDice: 'd12' } }),
    prisma.class.create({ data: { name: 'Bardo', description: 'Canções que alteram o destino', hitDice: 'd8' } }),
    prisma.class.create({ data: { name: 'Clérigo', description: 'Canaliza o poder de divindades', hitDice: 'd8' } }),
    prisma.class.create({ data: { name: 'Druida', description: 'Guardião das forças naturais', hitDice: 'd8' } }),
    prisma.class.create({ data: { name: 'Guerreiro', description: 'Mestre da lâmina e da estratégia', hitDice: 'd10' } }),
    prisma.class.create({ data: { name: 'Monge', description: 'Equilíbrio, disciplina e golpes precisos', hitDice: 'd8' } }),
    prisma.class.create({ data: { name: 'Paladino', description: 'Juramento sagrado e justiça implacável', hitDice: 'd10' } }),
    prisma.class.create({ data: { name: 'Patrulheiro', description: 'Rastreador e arqueiro das fronteiras', hitDice: 'd10' } }),
    prisma.class.create({ data: { name: 'Ladino', description: 'Sombras, astúcia e golpes cirúrgicos', hitDice: 'd8' } }),
    prisma.class.create({ data: { name: 'Feiticeiro', description: 'Magia inata e selvagem', hitDice: 'd6' } }),
    prisma.class.create({ data: { name: 'Bruxo', description: 'Pactos com entidades antigas', hitDice: 'd8' } }),
    prisma.class.create({ data: { name: 'Mago', description: 'Estudioso da magia arcana', hitDice: 'd6' } }),
  ]);

  console.log(`${classes.length} classes criadas`);

  const spells = await Promise.all([
    prisma.spellTemplate.create({
      data: {
        name: 'Lâmina do Crepúsculo',
        level: 2,
        school: 'Evocação',
        castingTime: '1 ação',
        range: '18 metros',
        duration: 'Instantâneo',
        description: 'Uma lâmina de sombras corta o ar e perfura o inimigo.',
        damage: { type: 'sombria', diceCount: 3, diceType: 'd6' },
      },
    }),
    prisma.spellTemplate.create({
      data: {
        name: 'Círculo da Aurora',
        level: 1,
        school: 'Abjuração',
        castingTime: '1 ação bônus',
        range: 'Toque',
        duration: 'Instantâneo',
        description: 'Luz quente envolve um aliado, restaurando esperança.',
        damage: Prisma.JsonNull,
      },
    }),
    prisma.spellTemplate.create({
      data: {
        name: 'Passos de Bruma',
        level: 2,
        school: 'Transmutação',
        castingTime: '1 ação bônus',
        range: 'Pessoal',
        duration: '1 minuto',
        description: 'Seu corpo se torna névoa, atravessando obstáculos leves.',
        damage: Prisma.JsonNull,
      },
    }),
    prisma.spellTemplate.create({
      data: {
        name: 'Rajada Glacial',
        level: 3,
        school: 'Evocação',
        castingTime: '1 ação',
        range: '36 metros',
        duration: 'Instantâneo',
        description: 'Uma rajada de gelo congela o ar e os ossos.',
        damage: { type: 'gelo', diceCount: 6, diceType: 'd6' },
      },
    }),
    prisma.spellTemplate.create({
      data: {
        name: 'Sussurros da Mente',
        level: 2,
        school: 'Encantamento',
        castingTime: '1 ação',
        range: '12 metros',
        duration: '1 minuto',
        description: 'Vozes do vazio abalam a confiança do alvo.',
        damage: { type: 'psíquico', diceCount: 3, diceType: 'd4' },
      },
    }),
    prisma.spellTemplate.create({
      data: {
        name: 'Muralha de Âmbar',
        level: 3,
        school: 'Evocação',
        castingTime: '1 ação',
        range: '30 metros',
        duration: '10 minutos',
        description: 'Ergue uma parede translúcida que bloqueia ataques.',
        damage: Prisma.JsonNull,
      },
    }),
    prisma.spellTemplate.create({
      data: {
        name: 'Fagulha de Dragão',
        level: 1,
        school: 'Evocação',
        castingTime: '1 ação',
        range: '18 metros',
        duration: 'Instantâneo',
        description: 'Uma fagulha explosiva que queima o alvo.',
        damage: { type: 'fogo', diceCount: 2, diceType: 'd6' },
      },
    }),
  ]);

  console.log(`${spells.length} feitiços criados`);

  const items = await Promise.all([
    prisma.itemTemplate.create({
      data: {
        name: 'Lâmina de Ébano',
        type: 'arma',
        description: 'Espada forjada em aço negro, leve e afiada.',
        properties: { damage: '1d8 corte', rarity: 'raro', weight: 2.8 },
      },
    }),
    prisma.itemTemplate.create({
      data: {
        name: 'Manto do Sussurro',
        type: 'armadura',
        description: 'Capa que abafa passos e oculta o portador.',
        properties: { ac: 13, rarity: 'incomum', weight: 4 },
      },
    }),
    prisma.itemTemplate.create({
      data: {
        name: 'Poção de Brilho Solar',
        type: 'poção',
        description: 'Emana luz dourada e cura ferimentos leves.',
        properties: { healing: '2d4+4', rarity: 'incomum', weight: 0.4 },
      },
    }),
    prisma.itemTemplate.create({
      data: {
        name: 'Arco dos Ventos',
        type: 'arma',
        description: 'Arco leve que sussurra ao disparar.',
        properties: { damage: '1d8 perfuração', rarity: 'raro', weight: 1.5 },
      },
    }),
    prisma.itemTemplate.create({
      data: {
        name: 'Anel da Maré',
        type: 'acessório',
        description: 'Um anel azulado que vibra com a água próxima.',
        properties: { bonus: 'Resistência a frio', rarity: 'incomum' },
      },
    }),
    prisma.itemTemplate.create({
      data: {
        name: 'Escudo do Juramento',
        type: 'armadura',
        description: 'Escudo sagrado com inscrições antigas.',
        properties: { ac: 2, rarity: 'raro', weight: 6 },
      },
    }),
    prisma.itemTemplate.create({
      data: {
        name: 'Kit de Explorador',
        type: 'utilitário',
        description: 'Ferramentas e suprimentos para longas jornadas.',
        properties: { uses: 5, rarity: 'comum', weight: 4 },
      },
    }),
  ]);

  console.log(`${items.length} itens criados`);

  const monsters = await Promise.all([
    prisma.monsterTemplate.create({
      data: {
        name: 'Lobo Sombrio',
        challenge: 0.25,
        armorClass: 13,
        hitPoints: 11,
        stats: { strength: 12, dexterity: 14, constitution: 12, intelligence: 5, wisdom: 10, charisma: 7 },
        actions: { attack: 'Mordida. Ataque corpo-a-corpo com arma' },
      },
    }),
    prisma.monsterTemplate.create({
      data: {
        name: 'Guardião de Pedra',
        challenge: 2,
        armorClass: 16,
        hitPoints: 38,
        stats: { strength: 16, dexterity: 8, constitution: 16, intelligence: 6, wisdom: 10, charisma: 5 },
        actions: { attack: 'Punho esmagador. Ataque corpo-a-corpo com arma' },
      },
    }),
    prisma.monsterTemplate.create({
      data: {
        name: 'Serpente Ígnea',
        challenge: 3,
        armorClass: 15,
        hitPoints: 45,
        stats: { strength: 14, dexterity: 16, constitution: 14, intelligence: 8, wisdom: 12, charisma: 9 },
        actions: { attack: 'Investida flamejante. Ataque corpo-a-corpo' },
      },
    }),
    prisma.monsterTemplate.create({
      data: {
        name: 'Mímico Nebuloso',
        challenge: 1,
        armorClass: 14,
        hitPoints: 30,
        stats: { strength: 14, dexterity: 10, constitution: 14, intelligence: 6, wisdom: 10, charisma: 6 },
        actions: { attack: 'Pseudópode. Ataque corpo-a-corpo com arma' },
      },
    }),
    prisma.monsterTemplate.create({
      data: {
        name: 'Oráculo Desgarrado',
        challenge: 3,
        armorClass: 15,
        hitPoints: 52,
        stats: { strength: 10, dexterity: 12, constitution: 14, intelligence: 16, wisdom: 18, charisma: 14 },
        actions: { attack: 'Rajada psíquica. Ataque à distância com magia' },
      },
    }),
  ]);

  console.log(`${monsters.length} modelos de monstros criados`);

  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log('Nenhum usuário encontrado. Criei somente dados que não dependem de usuários.');
    return;
  }

  const creator = users[0];
  const party = users.slice(0, 4);

  const campaign = await prisma.campaign.create({
    data: {
      title: 'Coroa de Névoa e Ferro',
      description: 'Uma campanha épica em reinos despedaçados, onde rumores falam de uma coroa capaz de dobrar o tempo.',
      systemBase: 'D&D 5e',
      dmType: 'AI',
      creatorId: creator.id,
      inviteCode: crypto.randomUUID(),
    },
  });

  const campaignTwo = users.length > 1
    ? await prisma.campaign.create({
      data: {
        title: 'Marés de Âmbar',
        description: 'Intrigas entre cidades costeiras e um culto que desperta monstros do fundo do mar.',
        systemBase: 'D&D 5e',
        dmType: 'AI',
        creatorId: users[1].id,
        inviteCode: crypto.randomUUID(),
      },
    })
    : null;

  console.log('Campanhas criadas');

  await Promise.all(
    party.map((user) => prisma.campaignMember.create({
      data: { userId: user.id, campaignId: campaign.id },
    })),
  );

  if (campaignTwo) {
    await prisma.campaignMember.create({ data: { userId: creator.id, campaignId: campaignTwo.id } });
    if (users[1]) {
      await prisma.campaignMember.create({ data: { userId: users[1].id, campaignId: campaignTwo.id } });
    }
  }

  const characters = await Promise.all(
    party.map((user, index) => {
      const templates = [
        { name: 'Ayla Ventobranco', classId: classes[1].id, raceId: races[1].id, stats: { strength: 10, dexterity: 16, constitution: 12, intelligence: 13, wisdom: 12, charisma: 16 } },
        { name: 'Bram Garra-Rocha', classId: classes[0].id, raceId: races[2].id, stats: { strength: 18, dexterity: 12, constitution: 16, intelligence: 10, wisdom: 12, charisma: 8 } },
        { name: 'Lyra Rubicor', classId: classes[9].id, raceId: races[3].id, stats: { strength: 8, dexterity: 14, constitution: 12, intelligence: 14, wisdom: 10, charisma: 18 } },
        { name: 'Kael Maré-Dourada', classId: classes[7].id, raceId: races[0].id, stats: { strength: 13, dexterity: 16, constitution: 12, intelligence: 12, wisdom: 14, charisma: 11 } },
      ];
      const template = templates[index % templates.length];
      return prisma.character.create({
        data: {
          name: template.name,
          level: 3,
          hpCurrent: 24 + index * 3,
          hpMax: 24 + index * 3,
          avatarUrl: avatarSvg(template.name.charAt(0), ['#1E40AF', '#7C3AED', '#DC2626', '#059669'][index % 4]),
          userId: user.id,
          campaignId: campaign.id,
          raceId: template.raceId,
          classId: template.classId,
          attributes: template.stats,
        },
      });
    }),
  );

  console.log(`${characters.length} personagens criados`);

  for (const char of characters) {
    await prisma.characterItem.create({ data: { characterId: char.id, itemId: items[0].id } });
    await prisma.characterItem.create({ data: { characterId: char.id, itemId: items[2].id } });
  }

  for (const char of characters) {
    await prisma.characterSpell.create({ data: { characterId: char.id, spellId: spells[0].id } });
    await prisma.characterSpell.create({ data: { characterId: char.id, spellId: spells[2].id } });
    await prisma.characterSpell.create({ data: { characterId: char.id, spellId: spells[4].id } });
  }

  await prisma.session.create({
    data: {
      title: 'Sessão 1 — O Eco das Ruínas',
      status: 'ACTIVE',
      scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      campaignId: campaign.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'A névoa cobre o vale e o som de sinos distantes anuncia a chegada da noite.',
      senderId: creator.id,
      campaignId: campaign.id,
      senderRole: 'AI_DM',
    },
  });

  await prisma.message.create({
    data: {
      content: 'Ayla observa as trilhas e sente o vento mudar.',
      senderId: party[0].id,
      campaignId: campaign.id,
      senderRole: 'USER',
    },
  });

  await prisma.message.create({
    data: {
      content: 'Bram bate o punho no escudo, jurando proteger o grupo.',
      senderId: party[1]?.id || party[0].id,
      campaignId: campaign.id,
      senderRole: 'USER',
    },
  });

  await prisma.message.create({
    data: {
      content: 'Uma sombra cruza a estrada, como se o céu piscasse.',
      senderId: creator.id,
      campaignId: campaign.id,
      senderRole: 'AI_DM',
    },
  });

  const generatedMap = generateMap(campaign.id);
  const positions: Record<string, { x: number; y: number }> = {};
  characters.forEach((char, idx) => {
    positions[char.id] = { x: 2 + idx * 2, y: 3 + (idx % 3) };
  });

  await prisma.map.create({
    data: {
      id: generatedMap.id,
      name: generatedMap.name,
      imageUrl: generatedMap.imageUrl,
      gridConfig: {
        ...generatedMap.gridConfig,
        positions,
      },
      campaignId: campaign.id,
    },
  });

  await prisma.combatEncounter.create({
    data: {
      isActive: false,
      round: 1,
      turnOrder: {},
      campaignId: campaign.id,
    },
  });

  await prisma.monster.create({
    data: {
      name: 'Lobo Sombrio Alfa',
      monsterTemplateId: monsters[0].id,
      campaignId: campaign.id,
    },
  });

  await prisma.monster.create({
    data: {
      name: 'Guardião de Pedra Quebrado',
      monsterTemplateId: monsters[1].id,
      campaignId: campaign.id,
    },
  });

  await prisma.monster.create({
    data: {
      name: 'Mímico Nebuloso',
      monsterTemplateId: monsters[3].id,
      campaignId: campaign.id,
    },
  });

  if (campaignTwo) {
    const secondaryChars = await Promise.all([
      prisma.character.create({
        data: {
          name: 'Soren Maré-Ambar',
          level: 2,
          hpCurrent: 18,
          hpMax: 18,
          avatarUrl: avatarSvg('S', '#0EA5E9'),
          userId: users[1]?.id || creator.id,
          campaignId: campaignTwo.id,
          raceId: races[0].id,
          classId: classes[7].id,
          attributes: { strength: 12, dexterity: 15, constitution: 12, intelligence: 10, wisdom: 14, charisma: 11 },
        },
      }),
      prisma.character.create({
        data: {
          name: 'Maelin da Espuma',
          level: 2,
          hpCurrent: 16,
          hpMax: 16,
          avatarUrl: avatarSvg('M', '#F59E0B'),
          userId: creator.id,
          campaignId: campaignTwo.id,
          raceId: races[1].id,
          classId: classes[1].id,
          attributes: { strength: 9, dexterity: 14, constitution: 11, intelligence: 13, wisdom: 12, charisma: 16 },
        },
      }),
    ]);

    for (const char of secondaryChars) {
      await prisma.characterItem.create({ data: { characterId: char.id, itemId: items[3].id } });
    }

    await prisma.session.create({
      data: {
        title: 'Sessão 0 — A Chama na Maré',
        status: 'PLANNED',
        scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        campaignId: campaignTwo.id,
      },
    });

    await prisma.message.create({
      data: {
        content: 'O som das ondas se mistura a cânticos ancestrais no cais.',
        senderId: users[1]?.id || creator.id,
        campaignId: campaignTwo.id,
        senderRole: 'AI_DM',
      },
    });

    const mapTwo = generateMap(campaignTwo.id);
    await prisma.map.create({
      data: {
        id: mapTwo.id,
        name: mapTwo.name,
        imageUrl: mapTwo.imageUrl,
        gridConfig: mapTwo.gridConfig,
        campaignId: campaignTwo.id,
      },
    });

    await prisma.monster.create({
      data: {
        name: 'Serpente Ígnea Escarlate',
        monsterTemplateId: monsters[2].id,
        campaignId: campaignTwo.id,
      },
    });
  }

  console.log('Banco alimentado com sucesso.');
}

main()
  .catch((e) => {
    console.error('Erro ao popular:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
