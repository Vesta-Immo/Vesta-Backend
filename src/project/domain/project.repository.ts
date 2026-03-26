// filepath: src/project/domain/project.repository.ts

import { Project, CreateProjectInput, UpdateProjectInput } from './project.types';

export const PROJECT_REPOSITORY = Symbol('PROJECT_REPOSITORY');

export interface ProjectRepository {
  create(userId: string, input: CreateProjectInput): Promise<Project>;
  findById(userId: string, projectId: string): Promise<Project | null>;
  findAllByUserId(userId: string): Promise<Project[]>;
  update(userId: string, projectId: string, input: UpdateProjectInput): Promise<Project>;
  delete(userId: string, projectId: string): Promise<void>;
}
