// filepath: src/financing-profile/infrastructure/http/dto/set-active-profile.request.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO pour définir le profil actif.
 */
export class SetActiveProfileRequestDto {
  @ApiProperty({
    description: 'ID du profil à définir comme actif',
    example: 'clxyz123abc',
  })
  @IsString()
  @IsNotEmpty()
  profileId!: string;
}
