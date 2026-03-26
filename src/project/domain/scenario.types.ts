// filepath: src/project/domain/scenario.types.ts

import { PropertyType } from '../../simulation/notary-fees/domain/notary-fees.types';

/**
 * Paramètres d'entrée d'un scénario.
 * Représente la configuration financière complète d'une simulation.
 */
export interface ScenarioInput {
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
 * Résultat calculé d'un scénario.
 * Null si le scénario n'a pas encore été calculé.
 */
export interface ScenarioOutput {
  // --- Capacité d'emprunt ---
  monthlyPaymentCapacity: number; // Capacité de remboursement / mois
  borrowingCapacity: number; // Montant empruntable

  // --- Budget global ---
  notaryFees: number; // Frais de notaire estimés
  totalBudget: number; // Budget total mobilisable

  // --- Mensualité ---
  monthlyCreditPayment: number; // Mensualité du crédit

  // --- Métadonnées de calcul ---
  computedAt: string; // ISO timestamp du calcul
  computationVersion: string; // Version des règles de calcul
}

export interface Scenario {
  id: string;
  projectId: string;
  name: string;
  inputParams: ScenarioInput;
  outputResult: ScenarioOutput | null;
  isBaseline: boolean;
  computedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
