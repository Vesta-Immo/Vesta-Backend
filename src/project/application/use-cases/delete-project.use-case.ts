// filepath: src/project/application/use-cases/delete-project.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(userId: string, projectId: string): Promise<void> {
    const existing = await this.projectRepository.findById(userId, projectId);
    if (!existing) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    await this.projectRepository.delete(userId, projectId);
  }
}
