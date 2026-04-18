import { PtzEligibilityInput, PtzEligibilityResult, PtzSimulationRecord } from './ptz.types';

/**
 * Repository pour les simulations PTZ
 */
export interface PtzEligibilityRepository {
  /**
   * Sauvegarde une simulation PTZ
   */
  save(input: PtzEligibilityInput, result: PtzEligibilityResult): Promise<PtzSimulationRecord>;

  /**
   * Récupère les simulations PTZ d'un utilisateur
   */
  findByUserId(userId: string): Promise<PtzSimulationRecord[]>;

  /**
   * Récupère une simulation PTZ par son ID
   */
  findById(id: string): Promise<PtzSimulationRecord | null>;

  /**
   * Vérifie si un PTZ existe déjà pour une opération donnée
   * 
   * Source : https://www.service-public.gouv.fr/particuliers/vorsdroits/F10871
   * 
   * Un seul PTZ peut être accordé par opération immobilière.
   * Cette méthode permet de vérifier l'unicité du PTZ par opération.
   * 
   * @param operationId L'identifiant unique de l'opération immobilière
   * @returns true si un PTZ existe déjà pour cette opération
   */
  existsByOperationId(operationId: string): Promise<boolean>;

  /**
   * Récupère une simulation PTZ par son operationId
   * 
   * @param operationId L'identifiant unique de l'opération immobilière
   * @returns La simulation PTZ si elle existe, null sinon
   */
  findByOperationId(operationId: string): Promise<PtzSimulationRecord | null>;
}
