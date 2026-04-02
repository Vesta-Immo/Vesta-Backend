// filepath: src/financing-profile/application/use-cases/update-profile-from-scenario.use-case.ts

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
import { FinancingProfile } from '../../domain/financing-profile.types';
import {
  ProfileNotFoundError,
  SourceScenarioNotFoundError,
} from '../../domain/errors/financing-profile.errors';

export interface UpdateProfileFromScenarioCommand {
  projectId: string;
  scenarioId: string;
}

export interface SyncResult {
  profile: FinancingProfile;
  wasActive: boolean;
  isComplete: boolean;
}

@Injectable()
export class UpdateProfileFromScenarioUseCase {
  constructor(
    @Inject(FINANCING_PROFILE_REPOSITORY)
    private readonly profileRepository: FinancingProfileRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: UserPreferencesRepository,
    @Inject(SCENARIO_REPOSITORY)
    private readonly scenarioRepository: ScenarioRepository,
  ) {}

  /**
   * Synchronise un profil depuis son scénario source.
   * Appelé automatiquement quand un scénario est modifié.
   */
  async execute(
    userId: string,
    command: UpdateProfileFromScenarioCommand,
  ): Promise<SyncResult | null> {
    // 1. Vérifier que le scénario existe
    const scenario = await this.scenarioRepository.findById(command.projectId, command.scenarioId);
    if (!scenario) {
      throw new SourceScenarioNotFoundError(command.scenarioId);
    }

    // 2. Trouver le profil lié à ce scénario
    const profile = await this.profileRepository.findByScenarioId(userId, command.scenarioId);
    if (!profile) {
      // Pas de profil lié, rien à synchroniser
      return null;
    }

    // 3. Vérifier si ce profil est actif
    const preferences = await this.preferencesRepository.getPreferences(userId);
    const wasActive = preferences.activeProfileId === profile.id;

    // 4. Mettre à jour le profil avec les nouvelles données du scénario
    const isComplete = this.isScenarioComplete(scenario.outputResult);
    const updated = await this.profileRepository.update(userId, profile.id, {
      settings: scenario.inputParams,
      isComplete,
    });

    return {
      profile: updated,
      wasActive,
      isComplete,
    };
  }

  private isScenarioComplete(outputResult: unknown | null): boolean {
    return outputResult !== null && typeof outputResult === 'object';
  }
}
