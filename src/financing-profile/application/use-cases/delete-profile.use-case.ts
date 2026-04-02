// filepath: src/financing-profile/application/use-cases/delete-profile.use-case.ts

import { Inject, Injectable } from '@nestjs/common';
import {
  FINANCING_PROFILE_REPOSITORY,
  FinancingProfileRepository,
  USER_PREFERENCES_REPOSITORY,
  UserPreferencesRepository,
} from '../../domain/financing-profile.repository';
import {
  ProfileNotFoundError,
  LastProfileDeletionError,
} from '../../domain/errors/financing-profile.errors';

export interface DeleteProfileCommand {
  profileId: string;
  /**
   * ID du profil à définir comme actif après suppression.
   * Si non fourni et que c'est le dernier profil, une erreur est levée.
   */
  replacementProfileId?: string;
}

export interface DeleteProfileResult {
  deletedProfileId: string;
  newActiveProfileId: string | null;
  requiresNewProfile: boolean;
}

@Injectable()
export class DeleteProfileUseCase {
  constructor(
    @Inject(FINANCING_PROFILE_REPOSITORY)
    private readonly profileRepository: FinancingProfileRepository,
    @Inject(USER_PREFERENCES_REPOSITORY)
    private readonly preferencesRepository: UserPreferencesRepository,
  ) {}

  async execute(userId: string, command: DeleteProfileCommand): Promise<DeleteProfileResult> {
    // 1. Vérifier que le profil existe
    const profile = await this.profileRepository.findById(userId, command.profileId);
    if (!profile) {
      throw new ProfileNotFoundError(command.profileId);
    }

    // 2. Vérifier si c'est le profil actif
    const preferences = await this.preferencesRepository.getPreferences(userId);
    const isActive = preferences.activeProfileId === command.profileId;

    // 3. Compter les profils restants
    const profileCount = await this.profileRepository.countByUserId(userId);
    const isLastProfile = profileCount <= 1;

    // 4. Gérer la suppression du dernier profil
    if (isLastProfile && !command.replacementProfileId) {
      throw new LastProfileDeletionError();
    }

    // 5. Déterminer le nouveau profil actif si nécessaire
    let newActiveProfileId: string | null = null;
    let requiresNewProfile = false;

    if (isActive) {
      if (command.replacementProfileId) {
        // Vérifier que le remplacement existe
        const replacement = await this.profileRepository.findById(
          userId,
          command.replacementProfileId,
        );
        if (!replacement) {
          throw new ProfileNotFoundError(command.replacementProfileId);
        }
        newActiveProfileId = command.replacementProfileId;
      } else if (!isLastProfile) {
        // Sélectionner automatiquement un autre profil
        const otherProfiles = await this.profileRepository.findAllByUserId(userId);
        const alternative = otherProfiles.find((p) => p.id !== command.profileId);
        if (alternative) {
          newActiveProfileId = alternative.id;
        }
      } else {
        requiresNewProfile = true;
      }

      // Mettre à jour le profil actif
      await this.preferencesRepository.setActiveProfile(userId, newActiveProfileId);
    }

    // 6. Supprimer le profil
    await this.profileRepository.delete(userId, command.profileId);

    return {
      deletedProfileId: command.profileId,
      newActiveProfileId,
      requiresNewProfile,
    };
  }
}
