/**
 * Zones géographiques PTZ
 *
 * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
 *
 * La zone A bis a été ajoutée en 2025 pour les zones les plus tendues.
 * Les plafonds de prix de la zone A bis sont identiques à la zone A.
 */
export enum PtzZone {
  ZONE_A = 'A',
  ZONE_A_BIS = 'A_BIS',
  ZONE_B1 = 'B1',
  ZONE_B2 = 'B2',
  ZONE_C = 'C',
}

/**
 * Type de bien immobilier
 *
 * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
 *
 * La distinction entre maison individuelle et logement collectif impacte
 * les quotités de financement applicables selon le RFR.
 */
export enum PropertyType {
  COLLECTIF = 'COLLECTIF',
  MAISON_INDIVIDUELLE = 'MAISON_INDIVIDUELLE',
}

/**
 * Type d'opération PTZ
 *
 * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
 *
 * - NEUF : Logement neuf ou en VEFA
 * - ANCIEN_AVEC_TRAVAUX : Logement ancien avec travaux (≥25% du coût total)
 * - ANCIEN_SANS_TRAVAUX : Logement ancien sans travaux (non éligible PTZ)
 * - VENTE_HLM : Achat de son logement social par l'occupant
 */
export enum OperationType {
  NEUF = 'NEUF',
  ANCIEN_AVEC_TRAVAUX = 'ANCIEN_AVEC_TRAVAUX',
  VENTE_HLM = 'VENTE_HLM',
}

/**
 * Types de prêts complémentaires
 * 
 * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F10871
 * 
 * Le PTZ doit être demandé en complément d'au moins un autre prêt :
 * - PAS (Prêt d'Accession Sociale)
 * - Prêt conventionné
 * - Prêt classique
 * - PEL (Prêt Épargne Logement)
 * - Prêt complémentaire
 */
export enum ComplementaryLoanType {
  PAS = 'PAS',
  CONVENTIONNE = 'CONVENTIONNE',
  CLASSIQUE = 'CLASSIQUE',
  PEL = 'PEL',
  COMPLEMENTAIRE = 'COMPLEMENTAIRE',
}

/**
 * Statut de primo-accédance avec exceptions
 *
 * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F10871
 *
 * Exceptions à la condition de primo-accédance :
 * - Personne divorcée ou séparée de corps
 * - Victime d'une catastrophe naturelle ou technologique
 * - Titulaire de la carte d'invalidité (2ème ou 3ème catégorie)
 * - Bénéficiaire de l'AAH (Allocation Adulte Handicapé)
 * - Bénéficiaire de l'AEEH (Allocation d'Éducation de l'Enfant Handicapé)
 */
export enum PrimoAccedantException {
  DIVORCE_SEPARATION = 'DIVORCE_SEPARATION',
  CATASTROPHE_NATURELLE = 'CATASTROPHE_NATURELLE',
  CARTE_INVALIDITE = 'CARTE_INVALIDITE',
  AAH = 'AAH',
  AEEH = 'AEEH',
}

/**
 * Statut complet de primo-accédance
 */
export interface PrimoAccedantStatus {
  isPrimoAccedant: boolean;
  exception?: PrimoAccedantException;
}

/**
 * Tranches de RFR pour les quotités variables
 *
 * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
 *
 * Les quotités de financement varient selon le RFR en % du plafond :
 * - Tranche 1 : RFR ≤ 45% du plafond
 * - Tranche 2 : 45% < RFR ≤ 60% du plafond
 * - Tranche 3 : 60% < RFR ≤ 75% du plafond
 * - Tranche 4 : RFR > 75% du plafond
 */
export enum RfrTranche {
  TRANCHE_1 = 'TRANCHE_1', // ≤ 45%
  TRANCHE_2 = 'TRANCHE_2', // 45% - 60%
  TRANCHE_3 = 'TRANCHE_3', // 60% - 75%
  TRANCHE_4 = 'TRANCHE_4', // > 75%
}

/**
 * Période de remboursement du PTZ
 *
 * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F34966
 *
 * La durée totale de remboursement est de 20 à 25 ans selon la zone et le type de bien.
 * La durée de différé dépend du RFR en % du plafond :
 * - RFR ≤ 45% du plafond : différé de 10 ans (120 mois)
 * - 45% < RFR ≤ 60% du plafond : différé de 8 ans (96 mois)
 * - 60% < RFR ≤ 75% du plafond : différé de 5 ans (60 mois)
 * - RFR > 75% du plafond : pas de différé
 */
export enum PtzRepaymentPeriod {
  PERIOD_25_YEARS = 300, // 25 ans en mois
  PERIOD_20_YEARS = 240, // 20 ans en mois
}

/**
 * Échéancier de remboursement avec différé
 *
 * Le différé correspond à la période pendant laquelle seuls les intérêts sont dus
 * (ou aucune mensualité pour le PTZ à taux 0%)
 *
 * Durées corrigées pour 2025-2026 :
 * - Tranche 1 (≤45%) : 10 ans de différé (120 mois)
 * - Tranche 2 (45-60%) : 8 ans de différé (96 mois)
 * - Tranche 3 (60-75%) : 5 ans de différé (60 mois)
 * - Tranche 4 (>75%) : pas de différé
 */
export enum PtzRepaymentSchedule {
  DEFERRED_10_YEARS = 120, // 10 years deferred (RFR ≤ 45%)
  DEFERRED_8_YEARS = 96,   // 8 years deferred (45% < RFR ≤ 60%)
  DEFERRED_5_YEARS = 60,   // 5 years deferred (60% < RFR ≤ 75%)
  NO_DEFERRED = 0,         // No deferral (RFR > 75%)
}

/**
 * PTZ duration and deferral information
 */
export interface PtzDurationInfo {
  totalDurationMonths: number; // Total duration in months (240-300 = 20-25 years)
  deferredPeriodMonths: number; // Deferred period in months (0-120)
  repaymentPeriodMonths: number; // Repayment period in months
  rfrPercentage: number; // RFR as % of ceiling
  rfrTranche: RfrTranche; // Applied RFR tranche
}

/**
 * PTZ ceiling configuration by zone and household size
 */
export interface PtzPlafond {
  zone: PtzZone;
  householdSize: number;
  maxPropertyPrice: number; // in cents
  maxLoanPercentage: number; // percentage of price (0-100)
  maxRfr: number; // Maximum Reference Fiscal Income in cents
}

/**
 * Current PTZ conditions
 */
export interface PtzConditions {
  plafonds: PtzPlafond[];
  minWorkPercentage: number; // minimum work % for old properties
  ptzRate: number; // rate in basis points (0 for PTZ)
  maxDurationMonths: number; // maximum duration in months
}

/**
 * Input for checking PTZ eligibility
 */
export interface PtzEligibilityInput {
  userId: string;
  propertyPrice: number; // in cents
  propertyZone: PtzZone;
  householdSize: number;
  isPrimoAccedant: boolean;
  annualIncome: number; // annual income in cents
  workPercentage?: number; // work % if old property
  hasComplementaryLoan?: boolean; // true if complementary loan (required)
  complementaryLoanType?: ComplementaryLoanType; // Type of complementary loan
  hasDependencies?: boolean; // true if purchasing dependencies (garage, parking, cellar)
  operationId?: string; // Unique operation ID for uniqueness check
  primoAccedantException?: PrimoAccedantException; // Exception to first-time buyer rule
  isOldProperty?: boolean; // true if old property
  propertyType?: PropertyType; // COLLECTIF or MAISON_INDIVIDUELLE
  operationType?: OperationType; // NEUF, ANCIEN_AVEC_TRAVAUX or VENTE_HLM
  otherLoansAmount?: number; // Amount of other loans for the matching rule
}

/**
 * PTZ eligibility check result
 */
export interface PtzEligibilityResult {
  isEligible: boolean;
  reasons: string[]; // reasons for ineligibility if applicable
  maxPtzAmount?: number; // max PTZ amount in cents
  ptzRate?: number; // rate in basis points
  ptzDuration?: number; // duration in months
  durationInfo?: PtzDurationInfo; // detailed duration and deferral information
}

/**
 * Input pour calculer le montant PTZ
 */
export interface PtzAmountInput {
  propertyPrice: number; // en centimes
  propertyZone: PtzZone;
  householdSize: number;
  annualIncome: number; // en centimes
  workPercentage?: number;
  isNewProperty?: boolean; // true = neuf, false = ancien (défaut: false)
  hasComplementaryLoan?: boolean;
  complementaryLoanType?: ComplementaryLoanType;
  hasDependencies?: boolean;
  operationId?: string;
  primoAccedantException?: PrimoAccedantException;
  isOldProperty?: boolean;
  propertyType?: PropertyType; // COLLECTIF ou MAISON_INDIVIDUELLE
  operationType?: OperationType; // NEUF ou ANCIEN_AVEC_TRAVAUX
}

/**
 * Résultat du calcul du montant PTZ
 */
export interface PtzAmountResult {
  maxPtzAmount: number; // en centimes
  ptzRate: number; // en basis points
  ptzDuration: number; // en mois
  loanPercentage: number; // pourcentage appliqué
  durationInfo?: PtzDurationInfo; // informations détaillées sur durée et différé
}

/**
 * Record de simulation PTZ pour le repository
 */
export interface PtzSimulationRecord {
  id: string;
  userId: string;
  propertyPrice: number;
  propertyZone: string;
  householdSize: number;
  isPrimoAccedant: boolean;
  annualIncome: number;
  workPercentage: number;
  isEligible: boolean;
  maxPtzAmount: number;
  ptzRate: number;
  ptzDuration: number;
  createdAt: Date;
  updatedAt: Date;
}
