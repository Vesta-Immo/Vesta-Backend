// filepath: src/financing-profile/application/use-cases/set-active-profile.use-case.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCING_PROFILE_REPOSITORY,
  FinancingProfileRepository,
  USER_PREFERENCES_REPOSITORY,
  UserPreferencesRepository,
} from '../../domain/financing-profile.repository';
import { FinancingProfile } from '../../domain/financing-profile.types';
import {
  ProfileNotFoundError,
  IncompleteProfileError,
} from '../../domain/errors/financing-profile.errors';

export interface SetActiveProfileCommand {
  profileId: string;
}

@Injectable()
export class SetActiveProfileUseCase {
  constructor(
    @Inject(FINANCING_PROFILE_REPOSITORY)
    private readonly profileRepository: FinancingProfileRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: UserPreferencesRepository,
  ) {}

  async execute(userId: string, command: SetActiveProfileCommand): Promise<FinancingProfile> {
    // 1. Vérifier que le profil existe et appartient à l'utilisateur
    const profile = await this.profileRepository.findById(userId, command.profileId);
    if (!profile) {
      throw new ProfileNotFoundError(command.profileId);
    }

    // 2. Vérifier que le profil est complet
    if (!profile.isComplete) {
      throw new IncompleteProfileError(command.profileId);
    }

    // 3. Définir comme profil actif
    await this.preferencesRepository.setActiveProfile(userId, profile.id);

    return profile;
  }
}
