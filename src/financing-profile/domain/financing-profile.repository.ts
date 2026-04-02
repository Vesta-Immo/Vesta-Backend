// filepath: src/financing-profile/domain/financing-profile.repository.ts

import {
  FinancingProfile,
  CreateFinancingProfileInput,
  UpdateFinancingProfileInput,
  FinancingProfileSummary,
} from './financing-profile.types';

export const FINANCING_PROFILE_REPOSITORY = Symbol('FINANCING_PROFILE_REPOSITORY');

export interface FinancingProfileRepository {
  /**
   * Crée un nouveau profil de financement.
   */
  create(
    userId: string,
    input: CreateFinancingProfileInput,
  ): Promise<FinancingProfile>;

  /**
   * Trouve un profil par son ID.
   */
  findById(userId: string, profileId: string): Promise<FinancingProfile | null>;

  /**
   * Trouve un profil par le scénario source.
   */
  findByScenarioId(userId: string, scenarioId: string): Promise<FinancingProfile | null>;

  /**
   * Liste tous les profils d'un utilisateur (version complète).
   */
  findAllByUserId(userId: string): Promise<FinancingProfile[]>;

  /**
   * Liste tous les profils d'un utilisateur (version résumée).
   */
  findAllSummariesByUserId(userId: string): Promise<FinancingProfileSummary[]>;

  /**
   * Met à jour un profil existant.
   */
  update(
    userId: string,
    profileId: string,
    input: UpdateFinancingProfileInput,
  ): Promise<FinancingProfile>;

  /**
   * Supprime un profil.
   */
  delete(userId: string, profileId: string): Promise<void>;

  /**
   * Compte le nombre de profils d'un utilisateur.
   */
  countByUserId(userId: string): Promise<number>;
}

export const USER_PREFERENCES_REPOSITORY = Symbol('USER_PREFERENCES_REPOSITORY');

export interface UserPreferencesRepository {
  /**
   * Récupère les préférences de l'utilisateur.
   * Crée les préférences par défaut si elles n'existent pas.
   */
  getPreferences(userId: string): Promise<{ userId: string; activeProfileId: string | null }>;

  /**
   * Définit le profil actif de l'utilisateur.
   */
  setActiveProfile(userId: string, profileId: string | null): Promise<void>;

  /**
   * Récupère le profil actif complet de l'utilisateur.
   * Retourne null si aucun profil actif.
   */
  getActiveProfile(userId: string): Promise<FinancingProfile | null>;
}
