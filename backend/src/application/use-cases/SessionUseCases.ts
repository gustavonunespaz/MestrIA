import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { ICharacterRepository } from '@domain/repositories/ICharacterRepository';
import { Session } from '@domain/entities/Session';
import { CreateSessionDTO, UpdateSessionDTO, SessionResponseDTO, SessionStatus } from '@application/dto/SessionDTO';
import { StringUtils, DateUtils } from '@shared/utils';
import { ValidationError, NotFoundError } from '@shared/errors/AppError';

export class CreateSessionUseCase {
  constructor(private sessionRepository: ISessionRepository) {}

  async execute(dto: CreateSessionDTO): Promise<SessionResponseDTO> {
    // Validação
    if (!dto.campaignId || dto.campaignId.length === 0) {
      throw new ValidationError('A campanha é obrigatória');
    }

    if (!dto.status || !['PLANNED', 'ACTIVE', 'FINISHED'].includes(dto.status)) {
      throw new ValidationError('O status deve ser PLANNED, ACTIVE ou FINISHED');
    }

    // Criar entidade
    const session = new Session({
      id: StringUtils.generateId(),
      title: dto.title,
      scheduledFor: dto.scheduledFor,
      status: dto.status,
      summary: dto.summary,
      campaignId: dto.campaignId,
      createdAt: DateUtils.now(),
    });

    // Persistir
    const created = await this.sessionRepository.create(session);

    return new SessionResponseDTO({
      id: created.id,
      title: created.title,
      scheduledFor: created.scheduledFor,
      status: created.status,
      summary: created.summary,
      campaignId: created.campaignId,
      createdAt: created.createdAt,
    });
  }
}

export class GetSessionByIdUseCase {
  constructor(private sessionRepository: ISessionRepository) {}

  async execute(id: string): Promise<SessionResponseDTO> {
    const session = await this.sessionRepository.findById(id);

    if (!session) {
      throw new NotFoundError('Sessão');
    }

    return new SessionResponseDTO({
      id: session.id,
      title: session.title,
      scheduledFor: session.scheduledFor,
      status: session.status,
      summary: session.summary,
      campaignId: session.campaignId,
      createdAt: session.createdAt,
    });
  }
}

export class UpdateSessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private characterRepository?: ICharacterRepository,
  ) {}

  async execute(id: string, dto: UpdateSessionDTO): Promise<SessionResponseDTO> {
    const session = await this.sessionRepository.findById(id);

    if (!session) {
      throw new NotFoundError('Sessão');
    }

    // Validação de status se fornecido
    if (dto.status && !['PLANNED', 'ACTIVE', 'FINISHED'].includes(dto.status)) {
      throw new ValidationError('O status deve ser PLANNED, ACTIVE ou FINISHED');
    }

    // Atualizar campos
    if (dto.title !== undefined) session.title = dto.title;
    if (dto.scheduledFor !== undefined) session.scheduledFor = dto.scheduledFor;
    if (dto.status) session.status = dto.status;
    if (dto.summary !== undefined) session.summary = dto.summary;

    const updated = await this.sessionRepository.update(session);

    // se a sessão foi finalizada, apagar bots da campanha correspondente
    if (
      dto.status === 'FINISHED' &&
      this.characterRepository !== undefined
    ) {
      await this.characterRepository.deleteBotsByCampaignId(updated.campaignId);
    }

    return new SessionResponseDTO({
      id: updated.id,
      title: updated.title,
      scheduledFor: updated.scheduledFor,
      status: updated.status,
      summary: updated.summary,
      campaignId: updated.campaignId,
      createdAt: updated.createdAt,
    });
  }
}

export class DeleteSessionUseCase {
  constructor(private sessionRepository: ISessionRepository) {}

  async execute(id: string): Promise<void> {
    const session = await this.sessionRepository.findById(id);

    if (!session) {
      throw new NotFoundError('Sessão');
    }

    await this.sessionRepository.delete(id);
  }
}

export class ListSessionsByCampaignUseCase {
  constructor(private sessionRepository: ISessionRepository) {}

  async execute(campaignId: string): Promise<SessionResponseDTO[]> {
    const sessions = await this.sessionRepository.findByCampaignId(campaignId);

    return sessions.map(
      (session) =>
        new SessionResponseDTO({
          id: session.id,
          title: session.title,
          scheduledFor: session.scheduledFor,
          status: session.status,
          summary: session.summary,
          campaignId: session.campaignId,
          createdAt: session.createdAt,
        }),
    );
  }
}
