// filepath: src/project/domain/project.types.ts

export interface Project {
  id: string;
  userId: string;
  name: string;
  location: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: string;
  location?: string;
}

export interface UpdateProjectInput {
  name?: string;
  location?: string;
}
