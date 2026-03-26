// filepath: src/project/application/use-cases/create-project.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { CreateProjectInput, Project } from '../../domain/project.types';

export type CreateProjectCommand = CreateProjectInput;

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(userId: string, command: CreateProjectCommand): Promise<Project> {
    return this.projectRepository.create(userId, command);
  }
}
