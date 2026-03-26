// filepath: src/project/infrastructure/repositories/prisma-project.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { Project, CreateProjectInput, UpdateProjectInput } from '../../domain/project.types';
import { ProjectRepository } from '../../domain/project.repository';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves a supabaseAuthUserId to the internal User.id.
   * Creates the User record if it doesn't exist yet (first-touch pattern).
   */
  private async resolveUserId(supabaseAuthUserId: string): Promise<string> {
    const user = await this.prisma.user.upsert({
      where: { supabaseAuthUserId },
      create: { supabaseAuthUserId },
      update: {},
      select: { id: true },
    });
    return user.id;
  }

  async create(supabaseAuthUserId: string, input: CreateProjectInput): Promise<Project> {
    const userId = await this.resolveUserId(supabaseAuthUserId);
    const project = await this.prisma.project.create({
      data: { userId, name: input.name, location: input.location ?? null },
    });
    return this.mapToDomain(project);
  }

  async findById(supabaseAuthUserId: string, projectId: string): Promise<Project | null> {
    const userId = await this.resolveUserId(supabaseAuthUserId);
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    return project ? this.mapToDomain(project) : null;
  }

  async findAllByUserId(supabaseAuthUserId: string): Promise<Project[]> {
    const userId = await this.resolveUserId(supabaseAuthUserId);
    const projects = await this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return projects.map(this.mapToDomain);
  }

  async update(
    supabaseAuthUserId: string,
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    const userId = await this.resolveUserId(supabaseAuthUserId);
    const project = await this.prisma.project.update({
      where: { id: projectId, userId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.location !== undefined && { location: input.location }),
      },
    });
    return this.mapToDomain(project);
  }

  async delete(supabaseAuthUserId: string, projectId: string): Promise<void> {
    const userId = await this.resolveUserId(supabaseAuthUserId);
    await this.prisma.project.delete({ where: { id: projectId, userId } });
  }

  private mapToDomain(project: {
    id: string;
    userId: string;
    name: string;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Project {
    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      location: project.location,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
