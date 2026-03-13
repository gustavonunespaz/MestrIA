import { IClassRepository } from '@domain/repositories/IClassRepository';
import { Class } from '@domain/entities/Class';
import { CreateClassDTO, UpdateClassDTO, ClassResponseDTO } from '@application/dto/ClassDTO';
import { StringUtils } from '@shared/utils';
import { ValidationError, NotFoundError } from '@shared/errors/AppError';

export class CreateClassUseCase {
  constructor(private classRepository: IClassRepository) {}

  async execute(dto: CreateClassDTO): Promise<ClassResponseDTO> {
    // Validação
    if (!dto.name || dto.name.length < 2) {
      throw new ValidationError('O nome deve ter pelo menos 2 caracteres');
    }

    if (!dto.hitDice || dto.hitDice.length === 0) {
      throw new ValidationError('O dado de vida (hitDice) é obrigatório');
    }

    // Criar entidade
    const classEntity = new Class({
      id: StringUtils.generateId(),
      name: dto.name,
      description: dto.description,
      hitDice: dto.hitDice,
    });

    // Persistir
    const created = await this.classRepository.create(classEntity);

    return new ClassResponseDTO({
      id: created.id,
      name: created.name,
      description: created.description,
      hitDice: created.hitDice,
    });
  }
}

export class GetClassByIdUseCase {
  constructor(private classRepository: IClassRepository) {}

  async execute(id: string): Promise<ClassResponseDTO> {
    const classEntity = await this.classRepository.findById(id);

    if (!classEntity) {
      throw new NotFoundError('Classe');
    }

    return new ClassResponseDTO({
      id: classEntity.id,
      name: classEntity.name,
      description: classEntity.description,
      hitDice: classEntity.hitDice,
    });
  }
}

export class UpdateClassUseCase {
  constructor(private classRepository: IClassRepository) {}

  async execute(id: string, dto: UpdateClassDTO): Promise<ClassResponseDTO> {
    const classEntity = await this.classRepository.findById(id);

    if (!classEntity) {
      throw new NotFoundError('Classe');
    }

    // Atualizar campos
    if (dto.name) classEntity.name = dto.name;
    if (dto.description !== undefined) classEntity.description = dto.description;
    if (dto.hitDice) classEntity.hitDice = dto.hitDice;

    const updated = await this.classRepository.update(classEntity);

    return new ClassResponseDTO({
      id: updated.id,
      name: updated.name,
      description: updated.description,
      hitDice: updated.hitDice,
    });
  }
}

export class DeleteClassUseCase {
  constructor(private classRepository: IClassRepository) {}

  async execute(id: string): Promise<void> {
    const classEntity = await this.classRepository.findById(id);

    if (!classEntity) {
      throw new NotFoundError('Classe');
    }

    await this.classRepository.delete(id);
  }
}

export class ListAllClassesUseCase {
  constructor(private classRepository: IClassRepository) {}

  async execute(): Promise<ClassResponseDTO[]> {
    const classes = await this.classRepository.findAll();

    return classes.map(
      (classEntity) =>
        new ClassResponseDTO({
          id: classEntity.id,
          name: classEntity.name,
          description: classEntity.description,
          hitDice: classEntity.hitDice,
        }),
    );
  }
}
