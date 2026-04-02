// filepath: src/financing-profile/infrastructure/http/financing-profile.controller.ts

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CurrentUserId } from '../../../core/security/decorators/current-user-id.decorator';
import { SupabaseAuthGuard } from '../../../core/security/guards/supabase-auth.guard';
import { CreateProfileRequestDto } from './dto/create-profile.request.dto';
import { UpdateProfileRequestDto } from './dto/update-profile.request.dto';
import { SetActiveProfileRequestDto } from './dto/set-active-profile.request.dto';
import { DeleteProfileRequestDto } from './dto/delete-profile.request.dto';
import {
  FinancingProfileResponseDto,
  FinancingProfileSummaryDto,
  ProfilesListResponseDto,
  DeleteProfileResponseDto,
  SyncProfileResponseDto,
} from './dto/financing-profile.response.dto';
import { CreateProfileFromScenarioUseCase } from '../../application/use-cases/create-profile-from-scenario.use-case';
import { UpdateProfileFromScenarioUseCase } from '../../application/use-cases/update-profile-from-scenario.use-case';
import { SetActiveProfileUseCase } from '../../application/use-cases/set-active-profile.use-case';
import { DeleteProfileUseCase } from '../../application/use-cases/delete-profile.use-case';
import { GetProfilesUseCase } from '../../application/use-cases/get-profiles.use-case';
import { GetActiveProfileUseCase } from '../../application/use-cases/get-active-profile.use-case';
import { FinancingProfile } from '../../domain/financing-profile.types';

@ApiTags('financing-profiles')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('financing-profiles')
export class FinancingProfileController {
  constructor(
    private readonly createProfileUseCase: CreateProfileFromScenarioUseCase,
    private readonly updateProfileUseCase: UpdateProfileFromScenarioUseCase,
    private readonly setActiveProfileUseCase: SetActiveProfileUseCase,
    private readonly deleteProfileUseCase: DeleteProfileUseCase,
    private readonly getProfilesUseCase: GetProfilesUseCase,
    private readonly getActiveProfileUseCase: GetActiveProfileUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liste tous les profils de financement' })
  @ApiResponse({
    status: 200,
    description: 'Liste des profils avec profil actif',
    type: ProfilesListResponseDto,
  })
  async getProfiles(@CurrentUserId() userId: string): Promise<ProfilesListResponseDto> {
    const result = await this.getProfilesUseCase.execute(userId);

    return {
      profiles: result.profiles.map(this.toSummaryDto),
      activeProfileId: result.activeProfileId,
      activeProfile: result.activeProfile ? this.toResponseDto(result.activeProfile) : null,
    };
  }

  @Get('active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Récupère le profil actif' })
  @ApiResponse({
    status: 200,
    description: 'Profil actif (null si aucun profil actif n\'est défini)',
    type: FinancingProfileResponseDto,
  })
  async getActiveProfile(
    @CurrentUserId() userId: string,
  ): Promise<FinancingProfileResponseDto | null> {
    const profile = await this.getActiveProfileUseCase.executeSafe(userId);
    return profile ? this.toResponseDto(profile) : null;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crée un profil depuis un scénario' })
  @ApiResponse({
    status: 201,
    description: 'Profil créé et défini comme actif',
    type: FinancingProfileResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Un profil existe déjà pour ce scénario',
  })
  async createProfile(
    @CurrentUserId() userId: string,
    @Body() request: CreateProfileRequestDto,
  ): Promise<FinancingProfileResponseDto> {
    const profile = await this.createProfileUseCase.execute(userId, {
      projectId: request.projectId,
      scenarioId: request.scenarioId,
      name: request.name,
      description: request.description,
      updateIfExists: request.updateIfExists,
    });

    return this.toResponseDto(profile);
  }

  @Post(':profileId/sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Synchronise un profil depuis son scénario source' })
  @ApiResponse({
    status: 200,
    description: 'Profil synchronisé',
    type: SyncProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profil ou scénario non trouvé',
  })
  async syncProfile(
    @CurrentUserId() userId: string,
    @Param('profileId') profileId: string,
  ): Promise<SyncProfileResponseDto> {
    // Récupérer le profil pour obtenir les IDs source
    const profiles = await this.getProfilesUseCase.execute(userId);
    const profile = profiles.profiles.find((p) => p.id === profileId);

    if (!profile) {
      throw new Error(`Profil ${profileId} non trouvé`);
    }

    const result = await this.updateProfileUseCase.execute(userId, {
      projectId: profile.sourceProjectId,
      scenarioId: profile.sourceScenarioId,
    });

    if (!result) {
      throw new Error(`Impossible de synchroniser le profil ${profileId}`);
    }

    return {
      profileId: result.profile.id,
      wasActive: result.wasActive,
      isComplete: result.isComplete,
    };
  }

  @Post('set-active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Définit le profil actif' })
  @ApiResponse({
    status: 200,
    description: 'Profil défini comme actif',
    type: FinancingProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Profil incomplet',
  })
  @ApiResponse({
    status: 404,
    description: 'Profil non trouvé',
  })
  async setActiveProfile(
    @CurrentUserId() userId: string,
    @Body() request: SetActiveProfileRequestDto,
  ): Promise<FinancingProfileResponseDto> {
    const profileId = request.profileId;

    if (!profileId || typeof profileId !== 'string' || profileId.trim().length === 0) {
      throw new BadRequestException('profileId is required');
    }

    const profile = await this.setActiveProfileUseCase.execute(userId, {
      profileId,
    });

    return this.toResponseDto(profile);
  }

  @Patch(':profileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Met à jour les métadonnées d\'un profil' })
  @ApiResponse({
    status: 200,
    description: 'Profil mis à jour',
    type: FinancingProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profil non trouvé',
  })
  async updateProfile(
    @CurrentUserId() userId: string,
    @Param('profileId') profileId: string,
    @Body() request: UpdateProfileRequestDto,
  ): Promise<FinancingProfileResponseDto> {
    // Note: La mise à jour manuelle des métadonnées n'est pas encore implémentée
    // dans les use cases. On retourne le profil tel quel pour l'instant.
    const profiles = await this.getProfilesUseCase.execute(userId);
    const profile = profiles.profiles.find((p) => p.id === profileId);

    if (!profile) {
      throw new Error(`Profil ${profileId} non trouvé`);
    }

    // TODO: Implémenter UpdateProfileMetadataUseCase si nécessaire
    throw new Error('Mise à jour manuelle non implémentée - utilisez la synchronisation');
  }

  @Delete(':profileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprime un profil' })
  @ApiResponse({
    status: 200,
    description: 'Profil supprimé',
    type: DeleteProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Impossible de supprimer le dernier profil sans alternative',
  })
  @ApiResponse({
    status: 404,
    description: 'Profil non trouvé',
  })
  async deleteProfile(
    @CurrentUserId() userId: string,
    @Param('profileId') profileId: string,
    @Query() query: DeleteProfileRequestDto,
  ): Promise<DeleteProfileResponseDto> {
    const result = await this.deleteProfileUseCase.execute(userId, {
      profileId,
      replacementProfileId: query.replacementProfileId,
    });

    return {
      deletedProfileId: result.deletedProfileId,
      newActiveProfileId: result.newActiveProfileId,
      requiresNewProfile: result.requiresNewProfile,
    };
  }

  private toResponseDto(profile: FinancingProfile): FinancingProfileResponseDto {
    return {
      id: profile.id,
      sourceScenarioId: profile.sourceScenarioId,
      sourceProjectId: profile.sourceProjectId,
      settings: profile.settings,
      name: profile.name,
      description: profile.description ?? undefined,
      isComplete: profile.isComplete,
      lastSyncedAt: profile.lastSyncedAt.toISOString(),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  private toSummaryDto(profile: {
    id: string;
    name: string;
    sourceScenarioId: string;
    sourceProjectId: string;
    isComplete: boolean;
    lastSyncedAt: Date;
  }): FinancingProfileSummaryDto {
    return {
      id: profile.id,
      name: profile.name,
      sourceScenarioId: profile.sourceScenarioId,
      sourceProjectId: profile.sourceProjectId,
      isComplete: profile.isComplete,
      lastSyncedAt: profile.lastSyncedAt.toISOString(),
    };
  }
}
