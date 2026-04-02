// filepath: src/project/infrastructure/repositories/prisma-project.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma, Project as PrismaProject } from '@prisma/client';
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
      data: {
        userId,
        name: input.name,
        location: input.location ?? null,
        isImplicit: input.isImplicit ?? false,
      },
    });
    return this.mapToDomain(project);
  }

  async createImplicit(supabaseAuthUserId: string, name: string): Promise<Project> {
    const userId = await this.resolveUserId(supabaseAuthUserId);
    const project = await this.prisma.$transaction(async (tx) => {
      const implicitProject = await this.findAndNormalizeImplicitProject(tx, userId);
      if (implicitProject) {
        return implicitProject;
      }

      return tx.project.create({
        data: {
          userId,
          name,
          location: null,
          isImplicit: true,
        },
      });
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

  async findImplicitByUserId(supabaseAuthUserId: string): Promise<Project | null> {
    const userId = await this.resolveUserId(supabaseAuthUserId);
    const project = await this.prisma.$transaction(async (tx) => {
      return this.findAndNormalizeImplicitProject(tx, userId);
    });

    return project ? this.mapToDomain(project) : null;
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

  private async findAndNormalizeImplicitProject(
    tx: Prisma.TransactionClient,
    userId: string,
  ): Promise<PrismaProject | null> {
    const implicitProjects = await tx.project.findMany({
      where: { userId, isImplicit: true },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });

    if (implicitProjects.length === 0) {
      return null;
    }

    const [currentImplicit, ...duplicateImplicitProjects] = implicitProjects;

    if (duplicateImplicitProjects.length > 0) {
      await tx.project.updateMany({
        where: { id: { in: duplicateImplicitProjects.map((project) => project.id) } },
        data: { isImplicit: false },
      });
    }

    return currentImplicit;
  }

  private mapToDomain(project: {
    id: string;
    userId: string;
    name: string;
    location: string | null;
    isImplicit: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Project {
    return {
      id: project.id,
      userId: project.userId,
      name: project.name,
      location: project.location,
      isImplicit: project.isImplicit,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
