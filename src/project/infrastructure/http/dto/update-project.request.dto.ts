// filepath: src/project/infrastructure/http/dto/update-project.request.dto.ts
import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateProjectRequestDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;
}
