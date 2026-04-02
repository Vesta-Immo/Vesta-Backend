// filepath: src/financing-profile/infrastructure/http/dto/update-profile.request.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/**
 * DTO pour mettre à jour un profil manuellement.
 * Note: La mise à jour des paramètres financiers se fait via la synchronisation
 * depuis le scénario source.
 */
export class UpdateProfileRequestDto {
  @ApiPropertyOptional({
    description: 'Nouveau nom du profil',
    example: 'Configuration mise à jour',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Nouvelle description du profil',
    example: 'Description mise à jour',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
