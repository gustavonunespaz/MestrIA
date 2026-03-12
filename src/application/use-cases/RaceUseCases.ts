import { IRaceRepository } from '@domain/repositories/IRaceRepository';
import { Race } from '@domain/entities/Race';
import { CreateRaceDTO, UpdateRaceDTO, RaceResponseDTO } from '@application/dto/RaceDTO';
import { StringUtils } from '@shared/utils';
import { ValidationError, NotFoundError } from '@shared/errors/AppError';

export class CreateRaceUseCase {
  constructor(private raceRepository: IRaceRepository) {}

  async execute(dto: CreateRaceDTO): Promise<RaceResponseDTO> {
    // Validação
    if (!dto.name || dto.name.length < 2) {
      throw new ValidationError('O nome deve ter pelo menos 2 caracteres');
    }

    if (!dto.traits || Object.keys(dto.traits).length === 0) {
      throw new ValidationError('As características (traits) são obrigatórias');
    }

    // Criar entidade
    const race = new Race({
      id: StringUtils.generateId(),
      name: dto.name,
      description: dto.description,
      traits: dto.traits,
    });

    // Persistir
    const created = await this.raceRepository.create(race);

    return new RaceResponseDTO({
      id: created.id,
      name: created.name,
      description: created.description,
      traits: created.traits,
    });
  }
}

export class GetRaceByIdUseCase {
  constructor(private raceRepository: IRaceRepository) {}

  async execute(id: string): Promise<RaceResponseDTO> {
    const race = await this.raceRepository.findById(id);

    if (!race) {
      throw new NotFoundError('Raça');
    }

    return new RaceResponseDTO({
      id: race.id,
      name: race.name,
      description: race.description,
      traits: race.traits,
    });
  }
}

export class UpdateRaceUseCase {
  constructor(private raceRepository: IRaceRepository) {}

  async execute(id: string, dto: UpdateRaceDTO): Promise<RaceResponseDTO> {
    const race = await this.raceRepository.findById(id);

    if (!race) {
      throw new NotFoundError('Raça');
    }

    // Atualizar campos
    if (dto.name) race.name = dto.name;
    if (dto.description !== undefined) race.description = dto.description;
    if (dto.traits) {
      race.traits = {
        ...race.traits,
        ...dto.traits,
      };
    }

    const updated = await this.raceRepository.update(race);

    return new RaceResponseDTO({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      traits: updated.traits,
    });
  }
}

export class DeleteRaceUseCase {
  constructor(private raceRepository: IRaceRepository) {}

  async execute(id: string): Promise<void> {
    const race = await this.raceRepository.findById(id);

    if (!race) {
      throw new NotFoundError('Raça');
    }

    await this.raceRepository.delete(id);
  }
}

export class ListAllRacesUseCase {
  constructor(private raceRepository: IRaceRepository) {}

  async execute(): Promise<RaceResponseDTO[]> {
    const races = await this.raceRepository.findAll();

    return races.map(
      (race) =>
        new RaceResponseDTO({
          id: race.id,
          name: race.name,
          description: race.description,
          traits: race.traits,
        }),
    );
  }
}
