export class CreateRaceDTO {
  name: string;
  description?: string;
  traits: Record<string, any>;

  constructor(data: {
    name: string;
    description?: string;
    traits: Record<string, any>;
  }) {
    this.name = data.name;
    this.description = data.description;
    this.traits = data.traits;
  }
}

export class UpdateRaceDTO {
  name?: string;
  description?: string;
  traits?: Record<string, any>;

  constructor(data: {
    name?: string;
    description?: string;
    traits?: Record<string, any>;
  }) {
    this.name = data.name;
    this.description = data.description;
    this.traits = data.traits;
  }
}

export class RaceResponseDTO {
  id: string;
  name: string;
  description?: string;
  traits: Record<string, any>;

  constructor(data: {
    id: string;
    name: string;
    description?: string;
    traits: Record<string, any>;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.traits = data.traits;
  }
}
