// filepath: src/financing-profile/domain/financing-profile.types.ts

import { PropertyType } from '../../simulation/notary-fees/domain/notary-fees.types';

/**
 * Paramètres financiers dénormalisés d'un profil.
 * Copie des données du scénario source pour usage indépendant.
 */
export interface FinancingProfileSettings {
  // --- Situation financière ---
  annualHouseholdIncome: number; // Revenus annuels nets du ménage
  monthlyCurrentDebtPayments: number; // Charges de crédits existantes / mois

  // --- Crédit ---
  annualRatePercent: number; // Taux d'intérêt annuel (ex: 3.5)
  durationMonths: number; // Durée en mois (ex: 240 pour 20 ans)
  maxDebtRatioPercent: number; // Taux d'endettement max (ex: 35)

  // --- Apport ---
  downPayment: number; // Apport personnel disponible

  // --- Frais de notaire ---
  propertyType: PropertyType; // Type de bien (influe sur les frais)
  departmentCode?: string; // Code département (pour majoration Paris)
}

/**
 * Profil de financement utilisateur.
 * Unifie la configuration financière pour les simulations.
 */
export interface FinancingProfile {
  id: string;
  userId: string;
  sourceScenarioId: string;
  sourceProjectId: string;

  // Données dénormalisées du scénario
  settings: FinancingProfileSettings;

  // Métadonnées
  name: string;
  description: string | null;
  isComplete: boolean;
  lastSyncedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input pour créer un profil depuis un scénario.
 */
export interface CreateFinancingProfileInput {
  sourceScenarioId: string;
  sourceProjectId: string;
  settings: FinancingProfileSettings;
  name: string;
  description?: string;
}

/**
 * Input pour mettre à jour un profil (sync depuis scénario).
 */
export interface UpdateFinancingProfileInput {
  settings?: FinancingProfileSettings;
  name?: string;
  description?: string;
  isComplete?: boolean;
}

/**
 * Résumé léger d'un profil pour les listes.
 */
export interface FinancingProfileSummary {
  id: string;
  name: string;
  sourceScenarioId: string;
  sourceProjectId: string;
  isComplete: boolean;
  lastSyncedAt: Date;
}

/**
 * Préférences utilisateur incluant le profil actif.
 */
export interface UserPreferences {
  userId: string;
  activeProfileId: string | null;
}

/**
 * Input pour définir le profil actif.
 */
export interface SetActiveProfileInput {
  profileId: string | null;
}
