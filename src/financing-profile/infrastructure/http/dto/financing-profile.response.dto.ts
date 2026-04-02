// filepath: src/financing-profile/infrastructure/http/dto/financing-profile.response.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinancingProfileSettingsDto } from './financing-profile-settings.dto';

/**
 * DTO de réponse pour un profil de financement complet.
 */
export class FinancingProfileResponseDto {
  @ApiProperty({
    description: 'ID unique du profil',
    example: 'clxyz123abc',
  })
  id!: string;

  @ApiProperty({
    description: 'ID du scénario source',
    example: 'clxyz456def',
  })
  sourceScenarioId!: string;

  @ApiProperty({
    description: 'ID du projet contenant le scénario source',
    example: 'clxyz789ghi',
  })
  sourceProjectId!: string;

  @ApiProperty({
    description: 'Paramètres financiers dénormalisés',
    type: FinancingProfileSettingsDto,
  })
  settings!: FinancingProfileSettingsDto;

  @ApiProperty({
    description: 'Nom du profil',
    example: 'Ma configuration optimiste',
  })
  name!: string;

  @ApiPropertyOptional({
    description: 'Description optionnelle',
    example: 'Configuration avec taux bas',
  })
  description?: string;

  @ApiProperty({
    description: 'Indique si le profil est complet (scénario calculé)',
    example: true,
  })
  isComplete!: boolean;

  @ApiProperty({
    description: 'Date de dernière synchronisation avec le scénario',
    example: '2026-03-31T10:00:00Z',
  })
  lastSyncedAt!: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2026-03-31T10:00:00Z',
  })
  createdAt!: string;

  @ApiProperty({
    description: 'Date de dernière modification',
    example: '2026-03-31T10:00:00Z',
  })
  updatedAt!: string;
}

/**
 * DTO de réponse pour un résumé de profil (liste).
 */
export class FinancingProfileSummaryDto {
  @ApiProperty({
    description: 'ID unique du profil',
    example: 'clxyz123abc',
  })
  id!: string;

  @ApiProperty({
    description: 'Nom du profil',
    example: 'Ma configuration optimiste',
  })
  name!: string;

  @ApiProperty({
    description: 'ID du scénario source',
    example: 'clxyz456def',
  })
  sourceScenarioId!: string;

  @ApiProperty({
    description: 'ID du projet contenant le scénario source',
    example: 'clxyz789ghi',
  })
  sourceProjectId!: string;

  @ApiProperty({
    description: 'Indique si le profil est complet',
    example: true,
  })
  isComplete!: boolean;

  @ApiProperty({
    description: 'Date de dernière synchronisation',
    example: '2026-03-31T10:00:00Z',
  })
  lastSyncedAt!: string;
}

/**
 * DTO de réponse pour la liste des profils avec profil actif.
 */
export class ProfilesListResponseDto {
  @ApiProperty({
    description: 'Liste des profils (résumés)',
    type: [FinancingProfileSummaryDto],
  })
  profiles!: FinancingProfileSummaryDto[];

  @ApiPropertyOptional({
    description: 'ID du profil actuellement actif',
    example: 'clxyz123abc',
    nullable: true,
  })
  activeProfileId!: string | null;

  @ApiPropertyOptional({
    description: 'Profil actif complet (si défini)',
    type: FinancingProfileResponseDto,
    nullable: true,
  })
  activeProfile!: FinancingProfileResponseDto | null;
}

/**
 * DTO de réponse après suppression d'un profil.
 */
export class DeleteProfileResponseDto {
  @ApiProperty({
    description: 'ID du profil supprimé',
    example: 'clxyz123abc',
  })
  deletedProfileId!: string;

  @ApiPropertyOptional({
    description: 'ID du nouveau profil actif (si changé)',
    example: 'clxyz789ghi',
    nullable: true,
  })
  newActiveProfileId!: string | null;

  @ApiProperty({
    description: 'Indique si un nouveau profil doit être créé',
    example: false,
  })
  requiresNewProfile!: boolean;
}

/**
 * DTO de réponse après synchronisation d'un profil.
 */
export class SyncProfileResponseDto {
  @ApiProperty({
    description: 'ID du profil synchronisé',
    example: 'clxyz123abc',
  })
  profileId!: string;

  @ApiProperty({
    description: 'Indique si le profil était actif',
    example: true,
  })
  wasActive!: boolean;

  @ApiProperty({
    description: 'Indique si le profil est complet après sync',
    example: true,
  })
  isComplete!: boolean;
}
