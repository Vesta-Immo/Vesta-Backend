// filepath: src/financing-profile/infrastructure/repositories/prisma-financing-profile.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  FinancingProfileRepository,
  UserPreferencesRepository,
} from '../../domain/financing-profile.repository';
import {
  FinancingProfile,
  CreateFinancingProfileInput,
  UpdateFinancingProfileInput,
  FinancingProfileSummary,
} from '../../domain/financing-profile.types';

@Injectable()
export class PrismaFinancingProfileRepository implements FinancingProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Résout un supabaseAuthUserId vers l'internal User.id.
   * Crée l'utilisateur si nécessaire (pattern first-touch).
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

  async create(
    supabaseAuthUserId: string,
    input: CreateFinancingProfileInput,
  ): Promise<FinancingProfile> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    const profile = await this.prisma.financingProfile.create({
      data: {
        userId,
        sourceScenarioId: input.sourceScenarioId,
        sourceProjectId: input.sourceProjectId,
        settings: input.settings as any,
        name: input.name,
        description: input.description ?? null,
        isComplete: true,
        lastSyncedAt: new Date(),
      },
    });

    return this.mapToDomain(profile);
  }

  async findById(
    supabaseAuthUserId: string,
    profileId: string,
  ): Promise<FinancingProfile | null> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    const profile = await this.prisma.financingProfile.findFirst({
      where: { id: profileId, userId },
    });

    return profile ? this.mapToDomain(profile) : null;
  }

  async findByScenarioId(
    supabaseAuthUserId: string,
    scenarioId: string,
  ): Promise<FinancingProfile | null> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    const profile = await this.prisma.financingProfile.findFirst({
      where: { userId, sourceScenarioId: scenarioId },
    });

    return profile ? this.mapToDomain(profile) : null;
  }

  async findAllByUserId(supabaseAuthUserId: string): Promise<FinancingProfile[]> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    const profiles = await this.prisma.financingProfile.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return profiles.map(this.mapToDomain);
  }

  async findAllSummariesByUserId(
    supabaseAuthUserId: string,
  ): Promise<FinancingProfileSummary[]> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    const profiles = await this.prisma.financingProfile.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        sourceScenarioId: true,
        sourceProjectId: true,
        isComplete: true,
        lastSyncedAt: true,
      },
    });

    return profiles.map((p) => ({
      id: p.id,
      name: p.name,
      sourceScenarioId: p.sourceScenarioId,
      sourceProjectId: p.sourceProjectId,
      isComplete: p.isComplete,
      lastSyncedAt: p.lastSyncedAt,
    }));
  }

  async update(
    supabaseAuthUserId: string,
    profileId: string,
    input: UpdateFinancingProfileInput,
  ): Promise<FinancingProfile> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    const profile = await this.prisma.financingProfile.update({
      where: { id: profileId, userId },
      data: {
        ...(input.settings !== undefined && { settings: input.settings as any }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description ?? null }),
        ...(input.isComplete !== undefined && { isComplete: input.isComplete }),
        lastSyncedAt: new Date(),
      },
    });

    return this.mapToDomain(profile);
  }

  async delete(supabaseAuthUserId: string, profileId: string): Promise<void> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    await this.prisma.financingProfile.delete({
      where: { id: profileId, userId },
    });
  }

  async countByUserId(supabaseAuthUserId: string): Promise<number> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    return this.prisma.financingProfile.count({
      where: { userId },
    });
  }

  private mapToDomain(profile: {
    id: string;
    userId: string;
    sourceScenarioId: string;
    sourceProjectId: string;
    settings: unknown;
    name: string;
    description: string | null;
    isComplete: boolean;
    lastSyncedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): FinancingProfile {
    return {
      id: profile.id,
      userId: profile.userId,
      sourceScenarioId: profile.sourceScenarioId,
      sourceProjectId: profile.sourceProjectId,
      settings: profile.settings as FinancingProfile['settings'],
      name: profile.name,
      description: profile.description,
      isComplete: profile.isComplete,
      lastSyncedAt: profile.lastSyncedAt,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}

@Injectable()
export class PrismaUserPreferencesRepository implements UserPreferencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveUserId(supabaseAuthUserId: string): Promise<string> {
    const user = await this.prisma.user.upsert({
      where: { supabaseAuthUserId },
      create: { supabaseAuthUserId },
      update: {},
      select: { id: true },
    });
    return user.id;
  }

  async getPreferences(
    supabaseAuthUserId: string,
  ): Promise<{ userId: string; activeProfileId: string | null }> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    const prefs = await this.prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, activeProfileId: null },
      update: {},
      select: { activeProfileId: true },
    });

    return {
      userId,
      activeProfileId: prefs.activeProfileId,
    };
  }

  async setActiveProfile(supabaseAuthUserId: string, profileId: string | null): Promise<void> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    await this.prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, activeProfileId: profileId },
      update: { activeProfileId: profileId },
    });
  }

  async getActiveProfile(supabaseAuthUserId: string): Promise<FinancingProfile | null> {
    const userId = await this.resolveUserId(supabaseAuthUserId);

    const prefs = await this.prisma.userPreferences.findUnique({
      where: { userId },
      include: {
        activeProfile: true,
      },
    });

    if (!prefs?.activeProfile) {
      return null;
    }

    return this.mapProfileToDomain(prefs.activeProfile);
  }

  private mapProfileToDomain(profile: {
    id: string;
    userId: string;
    sourceScenarioId: string;
    sourceProjectId: string;
    settings: unknown;
    name: string;
    description: string | null;
    isComplete: boolean;
    lastSyncedAt: Date;
    createdAt: Date;
    updatedAt: Date;
  }): FinancingProfile {
    return {
      id: profile.id,
      userId: profile.userId,
      sourceScenarioId: profile.sourceScenarioId,
      sourceProjectId: profile.sourceProjectId,
      settings: profile.settings as FinancingProfile['settings'],
      name: profile.name,
      description: profile.description,
      isComplete: profile.isComplete,
      lastSyncedAt: profile.lastSyncedAt,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
