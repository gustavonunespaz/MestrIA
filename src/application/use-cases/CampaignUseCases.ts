import { ICampaignRepository } from '@domain/repositories/ICampaignRepository';
import { Campaign } from '@domain/entities/Campaign';
import {
  CreateCampaignDTO,
  UpdateCampaignDTO,
  CampaignResponseDTO,
} from '@application/dto/CampaignDTO';
import { StringUtils, DateUtils } from '@shared/utils';
import { ValidationError, NotFoundError } from '@shared/errors/AppError';

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

    if (!dto.description || dto.description.length < 10) {
      throw new ValidationError('A descrição deve ter pelo menos 10 caracteres');
    }

    // Gerar código de convite
    const inviteCode = StringUtils.generateId().substring(0, 8).toUpperCase();

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
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }
}

export class DeleteCampaignUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(id: string): Promise<void> {
    const campaign = await this.campaignRepository.findById(id);

    if (!campaign) {
      throw new NotFoundError('Campanha');
    }

    await this.campaignRepository.delete(id);
  }
}

export class ListCampaignsByCreatorUseCase {
  constructor(private campaignRepository: ICampaignRepository) {}

  async execute(creatorId: string): Promise<CampaignResponseDTO[]> {
    const campaigns = await this.campaignRepository.findByCreatorId(creatorId);

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
          createdAt: campaign.createdAt,
          updatedAt: campaign.updatedAt,
        }),
    );
  }
}
