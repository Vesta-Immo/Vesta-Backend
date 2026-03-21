import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../../../core/security/decorators/current-user-id.decorator';
import { SupabaseAuthGuard } from '../../../../core/security/guards/supabase-auth.guard';
import { UpsertPropertyListFinancingSettingsRequestDto } from './dto/upsert-property-list-financing-settings.request.dto';
import { SavePropertyListFinancingSettingsUseCase } from '../../application/use-cases/state/save-property-list-financing-settings.use-case';
import { AddPropertyToListRequestDto } from './dto/add-property-to-list.request.dto';
import { AddPropertyToListUseCase } from '../../application/use-cases/state/add-property-to-list.use-case';
import { GetPropertyListStateUseCase } from '../../application/use-cases/state/get-property-list-state.use-case';
import { GetPropertyListStateResponseDto } from './dto/get-property-list-state.response.dto';
import { RemovePropertyFromListUseCase } from '../../application/use-cases/state/remove-property-from-list.use-case';

@ApiTags('simulations')
@ApiSecurity('bearer')
@UseGuards(SupabaseAuthGuard)
@Controller('simulations/property-list')
export class PropertyListController {
  constructor(
    private readonly saveFinancingSettingsUseCase: SavePropertyListFinancingSettingsUseCase,
    private readonly addPropertyToListUseCase: AddPropertyToListUseCase,
    private readonly getPropertyListStateUseCase: GetPropertyListStateUseCase,
    private readonly removePropertyFromListUseCase: RemovePropertyFromListUseCase,
  ) {}

  @Post('settings')
  @HttpCode(HttpStatus.NO_CONTENT)
  async saveFinancingSettings(
    @CurrentUserId() userId: string,
    @Body() request: UpsertPropertyListFinancingSettingsRequestDto,
  ): Promise<void> {
    await this.saveFinancingSettingsUseCase.execute(userId, request);
  }

  @Post('items')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addProperty(
    @CurrentUserId() userId: string,
    @Body() request: AddPropertyToListRequestDto,
  ): Promise<void> {
    await this.addPropertyToListUseCase.execute(userId, request);
  }

  @Get('items')
  @HttpCode(HttpStatus.OK)
  async getListState(@CurrentUserId() userId: string): Promise<GetPropertyListStateResponseDto> {
    return this.getPropertyListStateUseCase.execute(userId);
  }

  @Delete('items/:propertyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProperty(
    @CurrentUserId() userId: string,
    @Param('propertyId') propertyId: string,
  ): Promise<void> {
    await this.removePropertyFromListUseCase.execute(userId, propertyId);
  }
}
