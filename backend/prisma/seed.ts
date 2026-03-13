import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando preenchimento do banco de dados...');

  // Limpar dados existentes
  await prisma.characterSpell.deleteMany();
  await prisma.characterItem.deleteMany();
  await prisma.monster.deleteMany();
  await prisma.character.deleteMany();
  await prisma.campaignMember.deleteMany();
  await prisma.combatEncounter.deleteMany();
  await prisma.message.deleteMany();
  await prisma.map.deleteMany();
  await prisma.session.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();
  await prisma.spellTemplate.deleteMany();
  await prisma.itemTemplate.deleteMany();
  await prisma.monsterTemplate.deleteMany();
  await prisma.class.deleteMany();
  await prisma.race.deleteMany();

  console.log('Dados existentes removidos');

  // Criar Raças
  const races = await Promise.all([
    prisma.race.create({
      data: {
        name: 'Humano',
        description: 'Uma raça versátil e ambiciosa',
        traits: {
          abilityScoreIncrease: 'Todos os atributos aumentam em 1',
          age: 'Humanos atingem a idade adulta no final dos seus adolescentes',
          alignment: 'Humanos tendem a nenhum alinhamento particular',
          size: 'Médio',
          speed: 30,
        },
      },
    }),
    prisma.race.create({
      data: {
        name: 'Elfo',
        description: 'Gracioso e de vida longa',
        traits: {
          abilityScoreIncrease: 'Destreza aumenta em 2',
          age: 'Elfos podem viver mais de 700 anos',
          alignment: 'Elfos amam liberdade e variedade',
          size: 'Médio',
          speed: 30,
        },
      },
    }),
    prisma.race.create({
      data: {
        name: 'Anão',
        description: 'Forte e resistente',
        traits: {
          abilityScoreIncrease: 'Constituição aumenta em 2',
          age: 'Anões atingem a idade adulta por volta dos 50 anos',
          alignment: 'A maioria dos anões tende a ser leal',
          size: 'Médio',
          speed: 25,
        },
      },
    }),
    prisma.race.create({
      data: {
        name: 'Halfling',
        description: 'Pequeno mas corajoso',
        traits: {
          abilityScoreIncrease: 'Destreza aumenta em 2',
          age: 'Halflings atingem a idade adulta com 20 anos',
          alignment: 'Halflings tendem para o bem caótico',
          size: 'Pequeno',
          speed: 25,
        },
      },
    }),
  ]);

  console.log(`${races.length} raças criadas`);

  // Criar Classes
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        name: 'Bárbaro',
        description: 'Um guerreiro feroz que pode entrar em fúria',
        hitDice: 'd12',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Bardo',
        description: 'Um artista carismático com habilidades mágicas',
        hitDice: 'd8',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Clérigo',
        description: 'Um lançador de magia divina com poderes de cura',
        hitDice: 'd8',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Druida',
        description: 'Um lançador de magia da natureza que pode se transformar',
        hitDice: 'd8',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Guerreiro',
        description: 'Um guerreiro hábil com expertise em armas',
        hitDice: 'd10',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Monge',
        description: 'Um artista marcial com habilidades de ki',
        hitDice: 'd8',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Paladino',
        description: 'Um guerreiro sagrado vinculado por um juramento',
        hitDice: 'd10',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Patrulheiro',
        description: 'Um rastreador hábil e arqueiro',
        hitDice: 'd10',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Ladino',
        description: 'Um especialista furtivo em engano',
        hitDice: 'd8',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Feiticeiro',
        description: 'Um lançador de magia com magia inata',
        hitDice: 'd6',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Bruxo',
        description: 'Um lançador que fez um pacto com um ser poderoso',
        hitDice: 'd8',
      },
    }),
    prisma.class.create({
      data: {
        name: 'Mago',
        description: 'Um lançador de magia culto da magia arcana',
        hitDice: 'd6',
      },
    }),
  ]);

  console.log(`${classes.length} classes criadas`);

  // Criar Usuários
  const passwordHash = await bcrypt.hash('senha123', 10);
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Silva',
        email: 'alice@example.com',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob Santos',
        email: 'bob@example.com',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carol Oliveira',
        email: 'carol@example.com',
        passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: 'David Costa',
        email: 'david@example.com',
        passwordHash,
      },
    }),
  ]);

  console.log(`${users.length} usuários criados`);

  // Criar Modelos de Feitiços
  const spells = await Promise.all([
    prisma.spellTemplate.create({
      data: {
        name: 'Bola de Fogo',
        level: 3,
        school: 'Evocação',
        castingTime: '1 ação',
        range: '150 pés',
        duration: 'Instantâneo',
        description: 'Um brilho luminoso passa por seu dedo apontado',
        damage: {
          type: 'fogo',
          diceCount: 8,
          diceType: 'd6',
        },
      },
    }),
    prisma.spellTemplate.create({
      data: {
        name: 'Míssil Mágico',
        level: 1,
        school: 'Evocação',
        castingTime: '1 ação',
        range: '120 pés',
        duration: 'Instantâneo',
        description: 'Você cria três dardos luminosos de força mágica',
        damage: {
          type: 'força',
          diceCount: 3,
          diceType: 'd4',
        },
      },
    }),
    prisma.spellTemplate.create({
      data: {
        name: 'Palavra de Cura',
        level: 1,
        school: 'Evocação',
        castingTime: '1 ação bônus',
        range: '60 pés',
        duration: 'Instantâneo',
        description: 'Uma criatura à sua escolha que você possa ver ao alcance',
        damage: null,
      },
    }),
    prisma.spellTemplate.create({
      data: {
        name: 'Raio Relampejante',
        level: 3,
        school: 'Evocação',
        castingTime: '1 ação',
        range: 'Pessoal',
        duration: 'Instantâneo',
        description: 'Um raio de relâmpago formando uma linha de 100 pés',
        damage: {
          type: 'relâmpago',
          diceCount: 8,
          diceType: 'd6',
        },
      },
    }),
  ]);

  console.log(`${spells.length} feitiços criados`);

  // Criar Modelos de Itens
  const items = await Promise.all([
    prisma.itemTemplate.create({
      data: {
        name: 'Espada Longa',
        type: 'arma',
        description: 'Uma arma versátil de corpo-a-corpo',
        properties: {
          damage: '1d8 corte',
          weight: 3,
          rarity: 'comum',
        },
      },
    }),
    prisma.itemTemplate.create({
      data: {
        name: 'Armadura de Placas',
        type: 'armadura',
        description: 'Armadura de placas de corpo inteiro',
        properties: {
          ac: 18,
          weight: 65,
          rarity: 'comum',
        },
      },
    }),
    prisma.itemTemplate.create({
      data: {
        name: 'Poção de Cura',
        type: 'poção',
        description: 'Restaura 2d4+2 pontos de vida',
        properties: {
          healing: '2d4+2',
          weight: 0.5,
          rarity: 'comum',
        },
      },
    }),
    prisma.itemTemplate.create({
      data: {
        name: 'Espada Curta',
        type: 'arma',
        description: 'Uma arma leve de corpo-a-corpo',
        properties: {
          damage: '1d6 perfuração',
          weight: 2,
          rarity: 'comum',
        },
      },
    }),
    prisma.itemTemplate.create({
      data: {
        name: 'Arco',
        type: 'arma',
        description: 'Uma arma à distância para setas',
        properties: {
          damage: '1d8 perfuração',
          weight: 2,
          rarity: 'comum',
        },
      },
    }),
  ]);

  console.log(`${items.length} itens criados`);

  // Criar Modelos de Monstros
  const monsters = await Promise.all([
    prisma.monsterTemplate.create({
      data: {
        name: 'Goblin',
        challenge: 0.25,
        armorClass: 15,
        hitPoints: 7,
        stats: {
          strength: 8,
          dexterity: 14,
          constitution: 10,
          intelligence: 10,
          wisdom: 8,
          charisma: 8,
        },
        actions: {
          attack: 'Cimitarra. Ataque corpo-a-corpo com arma',
          shortbow: 'Arco curto. Ataque à distância com arma',
        },
      },
    }),
    prisma.monsterTemplate.create({
      data: {
        name: 'Orc',
        challenge: 0.5,
        armorClass: 13,
        hitPoints: 15,
        stats: {
          strength: 16,
          dexterity: 12,
          constitution: 16,
          intelligence: 7,
          wisdom: 11,
          charisma: 10,
        },
        actions: {
          attack: 'Machado Grande. Ataque corpo-a-corpo com arma',
        },
      },
    }),
    prisma.monsterTemplate.create({
      data: {
        name: 'Dragão Filhote',
        challenge: 2,
        armorClass: 17,
        hitPoints: 22,
        stats: {
          strength: 15,
          dexterity: 10,
          constitution: 13,
          intelligence: 12,
          wisdom: 11,
          charisma: 10,
        },
        actions: {
          bite: 'Mordida. Ataque corpo-a-corpo com arma',
          breathWeapon: 'Sopro de Fogo. O dragão expele fogo',
        },
      },
    }),
    prisma.monsterTemplate.create({
      data: {
        name: 'Esqueleto',
        challenge: 0.125,
        armorClass: 15,
        hitPoints: 13,
        stats: {
          strength: 10,
          dexterity: 14,
          constitution: 15,
          intelligence: 6,
          wisdom: 8,
          charisma: 5,
        },
        actions: {
          attack: 'Espada curta. Ataque corpo-a-corpo com arma',
        },
      },
    }),
  ]);

  console.log(`${monsters.length} modelos de monstros criados`);

  // Criar Campanha
  const campaign = await prisma.campaign.create({
    data: {
      title: 'As Minas Perdidas de Phandalin',
      description: 'Uma clássica aventura nos Reinos Esquecidos',
      systemBase: 'D&D 5ª Edição',
      dmType: 'AI',
      creatorId: users[0].id,
      inviteCode: 'CAMP1234',
    },
  });

  console.log('Campanha criada:', campaign.title);

  // Adicionar membros da campanha
  await Promise.all([
    prisma.campaignMember.create({
      data: {
        userId: users[0].id,
        campaignId: campaign.id,
      },
    }),
    prisma.campaignMember.create({
      data: {
        userId: users[1].id,
        campaignId: campaign.id,
      },
    }),
    prisma.campaignMember.create({
      data: {
        userId: users[2].id,
        campaignId: campaign.id,
      },
    }),
  ]);

  console.log('Membros da campanha adicionados');

  // Create Characters
  const characters = await Promise.all([
    prisma.character.create({
      data: {
        name: 'Thordak Ironforge',
        level: 5,
        hpCurrent: 45,
        hpMax: 45,
        userId: users[0].id,
        campaignId: campaign.id,
        raceId: races[2].id, // Dwarf
        classId: classes[4].id, // Fighter
        attributes: {
          strength: 18,
          dexterity: 10,
          constitution: 16,
          intelligence: 12,
          wisdom: 14,
          charisma: 13,
        },
      },
    }),
    prisma.character.create({
      data: {
        name: 'Liriel Moonwhisper',
        level: 5,
        hpCurrent: 28,
        hpMax: 28,
        userId: users[1].id,
        campaignId: campaign.id,
        raceId: races[1].id, // Elf
        classId: classes[11].id, // Wizard
        attributes: {
          strength: 10,
          dexterity: 14,
          constitution: 12,
          intelligence: 18,
          wisdom: 13,
          charisma: 11,
        },
      },
    }),
    prisma.character.create({
      data: {
        name: 'Aramina Goldensong',
        level: 5,
        hpCurrent: 34,
        hpMax: 34,
        userId: users[2].id,
        campaignId: campaign.id,
        raceId: races[0].id, // Human
        classId: classes[2].id, // Cleric
        attributes: {
          strength: 14,
          dexterity: 12,
          constitution: 14,
          intelligence: 12,
          wisdom: 17,
          charisma: 15,
        },
      },
    }),
  ]);

  console.log(`Created ${characters.length} characters`);

  // Create character spells
  for (const char of characters) {
    if (char.name.includes('Liriel') || char.name.includes('Aramina')) {
      await prisma.characterSpell.create({
        data: {
          characterId: char.id,
          spellId: spells[0].id,
        },
      });
      await prisma.characterSpell.create({
        data: {
          characterId: char.id,
          spellId: spells[1].id,
        },
      });
    }
  }

  console.log('Added spells to characters');

  // Create character items
  for (const char of characters) {
    await prisma.characterItem.create({
      data: {
        characterId: char.id,
        itemId: items[0].id, // Longsword
      },
    });
    await prisma.characterItem.create({
      data: {
        characterId: char.id,
        itemId: items[2].id, // Health Potion
      },
    });
  }

  console.log('Added items to characters');

  // Create Session
  const session = await prisma.session.create({
    data: {
      title: 'First Adventure',
      status: 'ACTIVE',
      scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      campaignId: campaign.id,
    },
  });

  console.log('Created session:', session.title);

  // Create Messages
  await Promise.all([
    prisma.message.create({
      data: {
        content: 'You find yourselves in a bustling tavern...',
        senderId: users[0].id,
        campaignId: campaign.id,
        senderRole: 'AI_DM',
      },
    }),
    prisma.message.create({
      data: {
        content: 'Thordak orders an ale and scans the room',
        senderId: users[0].id,
        campaignId: campaign.id,
        senderRole: 'USER',
      },
    }),
    prisma.message.create({
      data: {
        content: 'Liriel approaches the bard to gather information',
        senderId: users[1].id,
        campaignId: campaign.id,
        senderRole: 'USER',
      },
    }),
  ]);

  console.log('Created messages');

  // Create Maps
  const map = await prisma.map.create({
    data: {
      name: 'Phandalin Town Map',
      imageUrl: 'https://example.com/maps/phandalin.png',
      gridConfig: {
        columns: 20,
        rows: 20,
        cellSize: 5,
      },
      campaignId: campaign.id,
    },
  });

  console.log('Created map:', map.name);

  // Create Combat Encounter
  const encounter = await prisma.combatEncounter.create({
    data: {
      isActive: false,
      round: 0,
      turnOrder: {},
      campaignId: campaign.id,
    },
  });

  console.log('Created combat encounter');

  // Create Monsters
  const monsterInstances = await Promise.all([
    prisma.monster.create({
      data: {
        name: 'Goblin Scout',
        monsterTemplateId: monsters[0].id,
        campaignId: campaign.id,
      },
    }),
    prisma.monster.create({
      data: {
        name: 'Orc Warrior',
        monsterTemplateId: monsters[1].id,
        campaignId: campaign.id,
      },
    }),
  ]);

  console.log(`Created ${monsterInstances.length} monster instances`);

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
