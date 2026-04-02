// filepath: src/financing-profile/infrastructure/http/dto/delete-profile.request.dto.ts

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO pour la suppression d'un profil.
 */
export class DeleteProfileRequestDto {
  @ApiPropertyOptional({
    description: 'ID du profil à définir comme actif après suppression (si le profil supprimé était actif)',
    example: 'clxyz789ghi',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  replacementProfileId?: string;
}
