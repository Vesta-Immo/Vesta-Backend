// filepath: src/financing-profile/application/use-cases/get-profiles.use-case.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCING_PROFILE_REPOSITORY,
  FinancingProfileRepository,
  USER_PREFERENCES_REPOSITORY,
  UserPreferencesRepository,
} from '../../domain/financing-profile.repository';
import {
  FinancingProfile,
  FinancingProfileSummary,
} from '../../domain/financing-profile.types';

export interface ProfilesWithActive {
  profiles: FinancingProfileSummary[];
  activeProfileId: string | null;
  activeProfile: FinancingProfile | null;
}

@Injectable()
export class GetProfilesUseCase {
  constructor(
    @Inject(FINANCING_PROFILE_REPOSITORY)
    private readonly profileRepository: FinancingProfileRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: UserPreferencesRepository,
  ) {}

  /**
   * Récupère tous les profils avec indication du profil actif.
   */
  async execute(userId: string): Promise<ProfilesWithActive> {
    const [profiles, preferences, activeProfile] = await Promise.all([
      this.profileRepository.findAllSummariesByUserId(userId),
      this.preferencesRepository.getPreferences(userId),
      this.preferencesRepository.getActiveProfile(userId),
    ]);

    return {
      profiles,
      activeProfileId: preferences.activeProfileId,
      activeProfile,
    };
  }
}
