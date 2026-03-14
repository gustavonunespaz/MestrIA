import { ICampaignRepository } from '@domain/repositories/ICampaignRepository';
import { Campaign } from '@domain/entities/Campaign';
import {
  CreateCampaignDTO,
  UpdateCampaignDTO,
  CampaignResponseDTO,
} from '@application/dto/CampaignDTO';
import { StringUtils, DateUtils } from '@shared/utils';
import { ValidationError, NotFoundError, ForbiddenError } from '@shared/errors/AppError';

export class CreateCampaignUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(
    creatorId: string,
    dto: CreateCampaignDTO,
  ): Promise<CampaignResponseDTO> {
    // Validação
    if (!dto.title || dto.title.length < 3) {
      throw new ValidationError('O título deve ter pelo menos 3 caracteres');
    }

    if (dto.description && dto.description.length < 10) {
      throw new ValidationError('A descrição deve ter pelo menos 10 caracteres');
    }

    // Gerar código de convite
    const inviteCode = StringUtils.generateId();

    // Criar entidade
    const campaign = new Campaign({
      id: StringUtils.generateId(),
      title: dto.title,
      description: dto.description,
      systemBase: dto.systemBase,
      dmType: dto.dmType,
      creatorId,
      inviteCode,
      createdAt: DateUtils.now(),
      updatedAt: DateUtils.now(),
    });

    // Persistir
    const created = await this.campaignRepository.create(campaign);

    return new CampaignResponseDTO({
      id: created.id,
      title: created.title,
      description: created.description,
      systemBase: created.systemBase,
      dmType: created.dmType,
      creatorId: created.creatorId,
      inviteCode: created.inviteCode,
      membersCount: created.membersCount,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    });
  }
}

export class GetCampaignByIdUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(id: string): Promise<CampaignResponseDTO> {
    const campaign = await this.campaignRepository.findById(id);

    if (!campaign) {
      throw new NotFoundError('Campanha');
    }

    return new CampaignResponseDTO({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      systemBase: campaign.systemBase,
      dmType: campaign.dmType,
      creatorId: campaign.creatorId,
      inviteCode: campaign.inviteCode,
      membersCount: campaign.membersCount,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    });
  }
}

export class UpdateCampaignUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(id: string, dto: UpdateCampaignDTO): Promise<CampaignResponseDTO> {
    const campaign = await this.campaignRepository.findById(id);

    if (!campaign) {
      throw new NotFoundError('Campanha');
    }

    // Atualizar apenas os campos fornecidos
    if (dto.title) campaign.title = dto.title;
    if (dto.description) campaign.description = dto.description;
    if (dto.systemBase) campaign.systemBase = dto.systemBase;
    campaign.updatedAt = DateUtils.now();

    const updated = await this.campaignRepository.update(campaign);

    return new CampaignResponseDTO({
      id: updated.id,
      title: updated.title,
      description: updated.description,
      systemBase: updated.systemBase,
      dmType: updated.dmType,
      creatorId: updated.creatorId,
      inviteCode: updated.inviteCode,
      membersCount: updated.membersCount,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }
}

export class DeleteCampaignUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const campaign = await this.campaignRepository.findById(id);

    if (!campaign) {
      throw new NotFoundError('Campanha');
    }

    if (campaign.creatorId !== userId) {
      throw new ForbiddenError('Apenas o criador pode apagar a campanha');
    }

    await this.campaignRepository.delete(id);
  }
}

export class ListCampaignsByUserUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(userId: string): Promise<CampaignResponseDTO[]> {
    const campaigns = await this.campaignRepository.findByUserId(userId);

    return campaigns.map(
      (campaign) =>
        new CampaignResponseDTO({
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          systemBase: campaign.systemBase,
          dmType: campaign.dmType,
          creatorId: campaign.creatorId,
          inviteCode: campaign.inviteCode,
          membersCount: campaign.membersCount,
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        }),
    );
  }
}

export class JoinCampaignByCodeUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(userId: string, inviteCode: string): Promise<CampaignResponseDTO> {
    if (!inviteCode || inviteCode.trim().length < 6) {
      throw new ValidationError('Código de convite inválido');
    }

    const campaign = await this.campaignRepository.findByCampaignCode(inviteCode.trim());

    if (!campaign) {
      throw new NotFoundError('Campanha');
    }

    await this.campaignRepository.addMember(campaign.id, userId);

    const updated = await this.campaignRepository.findById(campaign.id);
    const result = updated || campaign;

    return new CampaignResponseDTO({
      id: result.id,
      title: result.title,
      description: result.description,
      systemBase: result.systemBase,
      dmType: result.dmType,
      creatorId: result.creatorId,
      inviteCode: result.inviteCode,
      membersCount: result.membersCount,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }
}
