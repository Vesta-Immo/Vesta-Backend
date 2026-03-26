// filepath: src/project/application/use-cases/list-projects.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { PROJECT_REPOSITORY, ProjectRepository } from '../../domain/project.repository';
import { Project } from '../../domain/project.types';

@Injectable()
export class ListProjectsUseCase {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(userId: string): Promise<Project[]> {
    return this.projectRepository.findAllByUserId(userId);
  }
}
