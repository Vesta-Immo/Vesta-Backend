// filepath: src/financing-profile/application/use-cases/get-active-profile.use-case.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  USER_PREFERENCES_REPOSITORY,
  UserPreferencesRepository,
} from '../../domain/financing-profile.repository';
import { FinancingProfile } from '../../domain/financing-profile.types';
import { NoActiveProfileError } from '../../domain/errors/financing-profile.errors';

export interface ActiveProfileResult {
  profile: FinancingProfile;
  preferences: {
    userId: string;
    activeProfileId: string;
  };
}

@Injectable()
export class GetActiveProfileUseCase {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: UserPreferencesRepository,
  ) {}

  /**
   * Récupère le profil actif de l'utilisateur.
   * @throws NoActiveProfileError si aucun profil actif n'est défini
   */
  async execute(userId: string): Promise<ActiveProfileResult> {
    const profile = await this.preferencesRepository.getActiveProfile(userId);

    if (!profile) {
      throw new NoActiveProfileError();
    }

    return {
      profile,
      preferences: {
        userId,
        activeProfileId: profile.id,
      },
    };
  }

  /**
   * Récupère le profil actif ou null si aucun n'est défini.
   * Version "safe" qui ne lance pas d'exception.
   */
  async executeSafe(userId: string): Promise<FinancingProfile | null> {
    return this.preferencesRepository.getActiveProfile(userId);
  }
}
