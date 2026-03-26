// filepath: src/project/infrastructure/http/dto/create-project.request.dto.ts
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateProjectRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;
}
