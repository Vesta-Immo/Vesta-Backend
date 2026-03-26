// filepath: src/project/application/use-cases/update-project.use-case.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { UpdateProjectInput, Project } from '../../domain/project.types';

export type UpdateProjectCommand = UpdateProjectInput & { projectId: string };

@Injectable()
export class UpdateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(userId: string, command: UpdateProjectCommand): Promise<Project> {
    const existing = await this.projectRepository.findById(userId, command.projectId);
    if (!existing) {
      throw new NotFoundException(`Project ${command.projectId} not found`);
    }
    return this.projectRepository.update(userId, command.projectId, {
      name: command.name,
      location: command.location,
    });
  }
}
