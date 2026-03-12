export class CreateClassDTO {
  name: string;
  description?: string;
  hitDice: string;

  constructor(data: {
    name: string;
    description?: string;
    hitDice: string;
  }) {
    this.name = data.name;
    this.description = data.description;
    this.hitDice = data.hitDice;
  }
}

export class UpdateClassDTO {
  name?: string;
  description?: string;
  hitDice?: string;

  constructor(data: {
    name?: string;
    description?: string;
    hitDice?: string;
  }) {
    this.name = data.name;
    this.description = data.description;
    this.hitDice = data.hitDice;
  }
}

export class ClassResponseDTO {
  id: string;
  name: string;
  description?: string;
  hitDice: string;

  constructor(data: {
    id: string;
    name: string;
    description?: string;
    hitDice: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.hitDice = data.hitDice;
  }
}
