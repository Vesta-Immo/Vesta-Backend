// filepath: src/project/infrastructure/http/project.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUserId } from '../../../core/security/decorators/current-user-id.decorator';
import { SupabaseAuthGuard } from '../../../core/security/guards/supabase-auth.guard';
import { CreateProjectRequestDto } from './dto/create-project.request.dto';
import { UpdateProjectRequestDto } from './dto/update-project.request.dto';
import { ProjectResponseDto } from './dto/project.response.dto';
import { CreateProjectUseCase } from '../../application/use-cases/create-project.use-case';
import { ListProjectsUseCase } from '../../application/use-cases/list-projects.use-case';
import { GetProjectUseCase } from '../../application/use-cases/get-project.use-case';
import { UpdateProjectUseCase } from '../../application/use-cases/update-project.use-case';
import { DeleteProjectUseCase } from '../../application/use-cases/delete-project.use-case';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(
    @CurrentUserId() userId: string,
    @Body() request: CreateProjectRequestDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.createProjectUseCase.execute(userId, request);
    return this.toResponse(project);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listProjects(@CurrentUserId() userId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.listProjectsUseCase.execute(userId);
    return projects.map(this.toResponse);
  }

  @Get(':projectId')
  @HttpCode(HttpStatus.OK)
  async getProject(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.getProjectUseCase.execute(userId, projectId);
    return this.toResponse(project);
  }

  @Patch(':projectId')
  @HttpCode(HttpStatus.OK)
  async updateProject(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
    @Body() request: UpdateProjectRequestDto,
  ): Promise<ProjectResponseDto> {
    const project = await this.updateProjectUseCase.execute(userId, { projectId, ...request });
    return this.toResponse(project);
  }

  @Delete(':projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProject(
    @CurrentUserId() userId: string,
    @Param('projectId') projectId: string,
  ): Promise<void> {
    await this.deleteProjectUseCase.execute(userId, projectId);
  }

  private toResponse(project: { id: string; name: string; location: string | null; createdAt: Date; updatedAt: Date }): ProjectResponseDto {
    return {
      id: project.id,
      name: project.name,
      location: project.location,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    };
  }
}
