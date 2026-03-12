export class CreateCharacterDTO {
  name: string;
  campaignId: string;
  raceId: string;
  classId: string;
  level: number;
  hpCurrent: number;
  hpMax: number;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };

  constructor(data: {
    name: string;
    campaignId: string;
    raceId: string;
    classId: string;
    level: number;
    hpCurrent: number;
    hpMax: number;
    attributes: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
  }) {
    this.name = data.name;
    this.campaignId = data.campaignId;
    this.raceId = data.raceId;
    this.classId = data.classId;
    this.level = data.level;
    this.hpCurrent = data.hpCurrent;
    this.hpMax = data.hpMax;
    this.attributes = data.attributes;
  }
}

export class UpdateCharacterDTO {
  name?: string;
  level?: number;
  hpCurrent?: number;
  hpMax?: number;
  attributes?: {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
  };

  constructor(data: {
    name?: string;
    level?: number;
    hpCurrent?: number;
    hpMax?: number;
    attributes?: {
      strength?: number;
      dexterity?: number;
      constitution?: number;
      intelligence?: number;
      wisdom?: number;
      charisma?: number;
    };
  }) {
    this.name = data.name;
    this.level = data.level;
    this.hpCurrent = data.hpCurrent;
    this.hpMax = data.hpMax;
    this.attributes = data.attributes;
  }
}

export class CharacterResponseDTO {
  id: string;
  name: string;
  level: number;
  hpCurrent: number;
  hpMax: number;
  userId: string;
  campaignId: string;
  raceId: string;
  classId: string;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(data: {
    id: string;
    name: string;
    level: number;
    hpCurrent: number;
    hpMax: number;
    userId: string;
    campaignId: string;
    raceId: string;
    classId: string;
    attributes: {
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
    };
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.level = data.level;
    this.hpCurrent = data.hpCurrent;
    this.hpMax = data.hpMax;
    this.userId = data.userId;
    this.campaignId = data.campaignId;
    this.raceId = data.raceId;
    this.classId = data.classId;
    this.attributes = data.attributes;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
