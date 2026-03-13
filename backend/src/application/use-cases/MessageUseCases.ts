import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { Message } from '@domain/entities/Message';
import { CreateMessageDTO, UpdateMessageDTO, MessageResponseDTO, SenderRole } from '@application/dto/MessageDTO';
import { StringUtils, DateUtils } from '@shared/utils';
import { ValidationError, NotFoundError } from '@shared/errors/AppError';

export class CreateMessageUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(dto: CreateMessageDTO): Promise<MessageResponseDTO> {
    // Validação
    if (!dto.content || dto.content.trim().length === 0) {
      throw new ValidationError('O conteúdo da mensagem é obrigatório');
    }

    if (!dto.senderId || dto.senderId.length === 0) {
      throw new ValidationError('O remetente é obrigatório');
    }

    if (!dto.campaignId || dto.campaignId.length === 0) {
      throw new ValidationError('A campanha é obrigatória');
    }

    // Criar entidade
    const message = new Message({
      id: StringUtils.generateId(),
      content: dto.content,
      senderId: dto.senderId,
      campaignId: dto.campaignId,
      senderRole: dto.senderRole || 'USER',
      diceRoll: dto.diceRoll,
      isWhisper: dto.isWhisper || false,
      createdAt: DateUtils.now(),
    });

    // Persistir
    const created = await this.messageRepository.create(message);

    return new MessageResponseDTO({
      id: created.id,
      content: created.content,
      senderId: created.senderId,
      campaignId: created.campaignId,
      senderRole: created.senderRole,
      diceRoll: created.diceRoll,
      isWhisper: created.isWhisper,
      createdAt: created.createdAt,
    });
  }
}

export class GetMessageByIdUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(id: string): Promise<MessageResponseDTO> {
    const message = await this.messageRepository.findById(id);

    if (!message) {
      throw new NotFoundError('Mensagem');
    }

    return new MessageResponseDTO({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      campaignId: message.campaignId,
      senderRole: message.senderRole,
      diceRoll: message.diceRoll,
      isWhisper: message.isWhisper,
      createdAt: message.createdAt,
    });
  }
}

export class UpdateMessageUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(id: string, dto: UpdateMessageDTO): Promise<MessageResponseDTO> {
    const message = await this.messageRepository.findById(id);

    if (!message) {
      throw new NotFoundError('Mensagem');
    }

    // Atualizar campos
    if (dto.content) message.content = dto.content;
    if (dto.diceRoll !== undefined) message.diceRoll = dto.diceRoll;
    if (dto.isWhisper !== undefined && dto.isWhisper !== null) message.isWhisper = dto.isWhisper;

    // Nota: Para mensagens, geralmente não há update, apenas delete
    // Mas mantemos essa operação disponível

    return new MessageResponseDTO({
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      campaignId: message.campaignId,
      senderRole: message.senderRole,
      diceRoll: message.diceRoll,
      isWhisper: message.isWhisper,
      createdAt: message.createdAt,
    });
  }
}

export class DeleteMessageUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(id: string): Promise<void> {
    const message = await this.messageRepository.findById(id);

    if (!message) {
      throw new NotFoundError('Mensagem');
    }

    await this.messageRepository.delete(id);
  }
}

export class ListMessagesByCampaignUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(campaignId: string): Promise<MessageResponseDTO[]> {
    const messages = await this.messageRepository.findByCampaignId(campaignId);

    return messages.map(
      (message) =>
        new MessageResponseDTO({
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          campaignId: message.campaignId,
          senderRole: message.senderRole,
          diceRoll: message.diceRoll,
          isWhisper: message.isWhisper,
          createdAt: message.createdAt,
        }),
    );
  }
}

export class DeleteMessagesByCampaignUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(campaignId: string): Promise<void> {
    await this.messageRepository.deleteByCampaignId(campaignId);
  }
}
