// filepath: src/project/infrastructure/http/dto/project.response.dto.ts
export class ProjectResponseDto {
  id!: string;
  name!: string;
  location!: string | null;
  createdAt!: string;
  updatedAt!: string;
}
