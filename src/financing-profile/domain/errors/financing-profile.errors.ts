// filepath: src/financing-profile/domain/errors/financing-profile.errors.ts

/**
 * Erreur de base pour le domaine FinancingProfile.
 */
export class FinancingProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FinancingProfileError';
  }
}

/**
 * Profil non trouvé.
 */
export class ProfileNotFoundError extends FinancingProfileError {
  constructor(profileId: string) {
    super(`Profil de financement "${profileId}" non trouvé`);
    this.name = 'ProfileNotFoundError';
  }
}

/**
 * Scénario source non trouvé.
 */
export class SourceScenarioNotFoundError extends FinancingProfileError {
  constructor(scenarioId: string) {
    super(`Scénario source "${scenarioId}" non trouvé`);
    this.name = 'SourceScenarioNotFoundError';
  }
}

/**
 * Profil déjà existant pour ce scénario.
 */
export class ProfileAlreadyExistsError extends FinancingProfileError {
  constructor(scenarioId: string) {
    super(`Un profil existe déjà pour le scénario "${scenarioId}"`);
    this.name = 'ProfileAlreadyExistsError';
  }
}

/**
 * Impossible de supprimer le dernier profil sans alternative.
 */
export class LastProfileDeletionError extends FinancingProfileError {
  constructor() {
    super(
      'Impossible de supprimer le dernier profil. Vous devez d\'abord créer ou sélectionner un autre profil.',
    );
    this.name = 'LastProfileDeletionError';
  }
}

/**
 * Profil incomplet - opération bloquée.
 */
export class IncompleteProfileError extends FinancingProfileError {
  constructor(profileId: string) {
    super(`Le profil "${profileId}" est incomplet et ne peut pas être utilisé`);
    this.name = 'IncompleteProfileError';
  }
}

/**
 * Aucun profil actif défini.
 */
export class NoActiveProfileError extends FinancingProfileError {
  constructor() {
    super('Aucun profil de financement actif défini. Veuillez sélectionner ou créer un profil.');
    this.name = 'NoActiveProfileError';
  }
}

/**
 * Tentative de création alors qu'un profil actif existe déjà.
 * Utilisé pour forcer la confirmation de remplacement.
 */
export class ActiveProfileExistsError extends FinancingProfileError {
  constructor(currentProfileId: string) {
    super(`Un profil actif existe déjà. Utilisez la mise à jour ou confirmez le remplacement.`);
    this.name = 'ActiveProfileExistsError';
  }
}
