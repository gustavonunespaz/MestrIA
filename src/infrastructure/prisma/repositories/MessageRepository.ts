import { prisma } from '@infrastructure/prisma/client';
import { Message } from '@domain/entities/Message';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';

export class MessageRepository implements IMessageRepository {
  async findById(id: string): Promise<Message | null> {
    const message = await prisma.message.findUnique({
      where: { id },
    });
    return message ? this.mapToDomain(message) : null;
  }

  async findByCampaignId(campaignId: string, limit: number = 50): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return messages.reverse().map((msg: any) => this.mapToDomain(msg));
  }

  async create(message: Message): Promise<Message> {
    const created = await prisma.message.create({
      data: {
        content: message.content,
        senderId: message.senderId,
        campaignId: message.campaignId,
        senderRole: message.senderRole,
        diceRoll: message.diceRoll === null ? undefined : message.diceRoll,
        isWhisper: message.isWhisper,
      },
    });
    return this.mapToDomain(created);
  }

  async delete(id: string): Promise<void> {
    await prisma.message.delete({
      where: { id },
    });
  }

  async deleteByCampaignId(campaignId: string): Promise<void> {
    await prisma.message.deleteMany({
      where: { campaignId },
    });
  }

  private mapToDomain(raw: any): Message {
    return new Message({
      id: raw.id,
      content: raw.content,
      senderId: raw.senderId,
      campaignId: raw.campaignId,
      senderRole: raw.senderRole,
      diceRoll: raw.diceRoll,
      isWhisper: raw.isWhisper,
      createdAt: raw.createdAt,
    });
  }
}
