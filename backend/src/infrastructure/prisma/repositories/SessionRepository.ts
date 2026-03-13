import { prisma } from '@infrastructure/prisma/client';
import { Session } from '@domain/entities/Session';
import { ISessionRepository } from '@domain/repositories/ISessionRepository';

export class SessionRepository implements ISessionRepository {
  async findById(id: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: { id },
    });
    return session ? this.mapToDomain(session) : null;
  }

  async findByCampaignId(campaignId: string): Promise<Session[]> {
    const sessions = await prisma.session.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    });
    return sessions.map((session: any) => this.mapToDomain(session));
  }

  async create(session: Session): Promise<Session> {
    const created = await prisma.session.create({
      data: {
        title: session.title,
        scheduledFor: session.scheduledFor,
        status: session.status,
        summary: session.summary,
        campaignId: session.campaignId,
      },
    });
    return this.mapToDomain(created);
  }

  async update(session: Session): Promise<Session> {
    const updated = await prisma.session.update({
      where: { id: session.id },
      data: {
        title: session.title,
        scheduledFor: session.scheduledFor,
        status: session.status,
        summary: session.summary,
      },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.session.delete({
      where: { id },
    });
  }

  private mapToDomain(raw: any): Session {
    return new Session({
      id: raw.id,
      title: raw.title,
      scheduledFor: raw.scheduledFor,
      status: raw.status,
      summary: raw.summary,
      campaignId: raw.campaignId,
      createdAt: raw.createdAt,
    });
  }
}
