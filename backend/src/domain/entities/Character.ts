export interface CharacterProps {
  id: string;
  name: string;
  level: number;
  hpCurrent: number;
  hpMax: number;
  isAlive: boolean;
  isBot?: boolean | null;
  botType?: string | null;
  avatarUrl?: string | null;
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
}

export class Character {
  id: string;
  name: string;
  level: number;
  hpCurrent: number;
  hpMax: number;
  isAlive: boolean;
  isBot?: boolean | null;
  botType?: string | null;
  avatarUrl?: string | null;
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

  constructor(props: CharacterProps) {
    this.id = props.id;
    this.name = props.name;
    this.level = props.level;
    this.hpCurrent = props.hpCurrent;
    this.hpMax = props.hpMax;
    this.isAlive = props.isAlive;
    this.isBot = props.isBot;
    this.botType = props.botType;
    this.avatarUrl = props.avatarUrl;
    this.userId = props.userId;
    this.campaignId = props.campaignId;
    this.raceId = props.raceId;
    this.classId = props.classId;
    this.attributes = props.attributes;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
