// filepath: src/financing-profile/application/use-cases/create-profile-from-scenario.use-case.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCING_PROFILE_REPOSITORY,
  FinancingProfileRepository,
} from '../../domain/financing-profile.repository';
import {
  USER_PREFERENCES_REPOSITORY,
  UserPreferencesRepository,
} from '../../domain/financing-profile.repository';
import {
  SCENARIO_REPOSITORY,
  ScenarioRepository,
} from '../../../project/domain/scenario.repository';
import {
  FinancingProfile,
  CreateFinancingProfileInput,
} from '../../domain/financing-profile.types';
import {
  SourceScenarioNotFoundError,
  ProfileAlreadyExistsError,
} from '../../domain/errors/financing-profile.errors';

export interface CreateProfileFromScenarioCommand {
  projectId: string;
  scenarioId: string;
  name?: string;
  description?: string;
  /**
   * Si true, met à jour le profil existant lié à ce scénario au lieu de créer un nouveau.
   */
  updateIfExists?: boolean;
}

@Injectable()
export class CreateProfileFromScenarioUseCase {
  constructor(
    @Inject(FINANCING_PROFILE_REPOSITORY)
    private readonly profileRepository: FinancingProfileRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: UserPreferencesRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
  ) {}

  async execute(
    userId: string,
    command: CreateProfileFromScenarioCommand,
  ): Promise<FinancingProfile> {
    // 1. Vérifier que le scénario existe et appartient à l'utilisateur
    const scenario = await this.scenarioRepository.findById(command.projectId, command.scenarioId);
    if (!scenario) {
      throw new SourceScenarioNotFoundError(command.scenarioId);
    }

    // 2. Vérifier si un profil existe déjà pour ce scénario
    const existingProfile = await this.profileRepository.findByScenarioId(
      userId,
      command.scenarioId,
    );

    if (existingProfile && !command.updateIfExists) {
      throw new ProfileAlreadyExistsError(command.scenarioId);
    }

    // 3. Construire le nom auto si non fourni
    const profileName = command.name ?? `Profil "${scenario.name}"`;

    // 4. Créer ou mettre à jour le profil
    if (existingProfile && command.updateIfExists) {
      // Mise à jour du profil existant
      const updated = await this.profileRepository.update(userId, existingProfile.id, {
        settings: scenario.inputParams,
        name: profileName,
        description: command.description,
        isComplete: this.isScenarioComplete(scenario.outputResult),
      });

      // Mettre à jour comme profil actif
      await this.preferencesRepository.setActiveProfile(userId, updated.id);

      return updated;
    }

    // Création d'un nouveau profil
    const input: CreateFinancingProfileInput = {
      sourceScenarioId: command.scenarioId,
      sourceProjectId: command.projectId,
      settings: scenario.inputParams,
      name: profileName,
      description: command.description,
    };

    const profile = await this.profileRepository.create(userId, input);

    // 5. Définir comme profil actif
    await this.preferencesRepository.setActiveProfile(userId, profile.id);

    return profile;
  }

  /**
   * Détermine si un scénario est complet (a été calculé avec succès).
   */
  private isScenarioComplete(outputResult: unknown | null): boolean {
    return outputResult !== null && typeof outputResult === 'object';
  }
}
