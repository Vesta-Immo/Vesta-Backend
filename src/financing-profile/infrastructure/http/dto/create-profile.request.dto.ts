// filepath: src/financing-profile/infrastructure/http/dto/create-profile.request.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO pour créer un profil depuis un scénario.
 */
export class CreateProfileRequestDto {
  @ApiProperty({
    description: 'ID du projet contenant le scénario source',
    example: 'clxyz123abc',
  })
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @ApiProperty({
    description: 'ID du scénario source',
    example: 'clxyz456def',
  })
  @IsString()
  @IsNotEmpty()
  scenarioId!: string;

  @ApiPropertyOptional({
    description: 'Nom personnalisé du profil (auto-généré si non fourni)',
    example: 'Ma configuration optimiste',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description optionnelle du profil',
    example: 'Configuration avec taux bas et apport important',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Si true, met à jour le profil existant lié à ce scénario',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  updateIfExists?: boolean;
}
