// filepath: src/financing-profile/application/services/profile-sync.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { UpdateProfileFromScenarioUseCase } from '../use-cases/update-profile-from-scenario.use-case';

/**
 * Événement émis quand un scénario est modifié.
 * Ce type peut être étendu pour inclure d'autres métadonnées.
 */
export interface ScenarioUpdatedEvent {
  userId: string;
  projectId: string;
  scenarioId: string;
  /**
   * Type de modification effectuée sur le scénario.
   */
  changeType: 'input' | 'output' | 'name' | 'delete';
  /**
   * Timestamp de la modification.
   */
  timestamp: Date;
}

/**
 * Résultat de la synchronisation.
 */
export interface SyncResult {
  success: boolean;
  profileId?: string;
  wasActive?: boolean;
  isComplete?: boolean;
  error?: string;
}

/**
 * Service responsable de la synchronisation automatique
 * entre les scénarios et les profils de financement.
 *
 * Ce service peut être appelé :
 * - Directement par les use cases de scénario après modification
 * - Via un event bus (si implémenté plus tard)
 * - Par un webhook ou listener de changement base de données
 */
@Injectable()
export class ProfileSyncService {
  private readonly logger = new Logger(ProfileSyncService.name);

  constructor(private readonly updateFromScenarioUseCase: UpdateProfileFromScenarioUseCase) {}

  /**
   * Synchronise un profil quand son scénario source est modifié.
   *
   * @param event - Les détails de la modification du scénario
   * @returns Le résultat de la synchronisation
   */
  async handleScenarioUpdated(event: ScenarioUpdatedEvent): Promise<SyncResult> {
    this.logger.debug(
      `Synchronisation du profil pour le scénario ${event.scenarioId} (type: ${event.changeType})`,
    );

    try {
      // Ignorer les suppressions (gérées séparément)
      if (event.changeType === 'delete') {
        return { success: true };
      }

      const result = await this.updateFromScenarioUseCase.execute(event.userId, {
        projectId: event.projectId,
        scenarioId: event.scenarioId,
      });

      if (!result) {
        // Pas de profil lié à ce scénario
        return { success: true };
      }

      this.logger.debug(
        `Profil ${result.profile.id} synchronisé (actif: ${result.wasActive}, complet: ${result.isComplete})`,
      );

      return {
        success: true,
        profileId: result.profile.id,
        wasActive: result.wasActive,
        isComplete: result.isComplete,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Erreur lors de la synchronisation du profil pour le scénario ${event.scenarioId}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Vérifie si une synchronisation est nécessaire pour un scénario.
   * Utile pour éviter des appels inutiles.
   */
  shouldSync(changeType: ScenarioUpdatedEvent['changeType']): boolean {
    // On synchronise pour tous les changements sauf les suppressions
    // qui sont gérées différemment
    return changeType !== 'delete';
  }
}
