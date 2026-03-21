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
import { ApiKeyGuard } from '../../../../core/security/guards/api-key.guard';
import { UpsertPropertyListFinancingSettingsRequestDto } from './dto/upsert-property-list-financing-settings.request.dto';
import { SavePropertyListFinancingSettingsUseCase } from '../../application/use-cases/state/save-property-list-financing-settings.use-case';
import { AddPropertyToListRequestDto } from './dto/add-property-to-list.request.dto';
import { AddPropertyToListUseCase } from '../../application/use-cases/state/add-property-to-list.use-case';
import { GetPropertyListStateUseCase } from '../../application/use-cases/state/get-property-list-state.use-case';
import { GetPropertyListStateResponseDto } from './dto/get-property-list-state.response.dto';
import { RemovePropertyFromListUseCase } from '../../application/use-cases/state/remove-property-from-list.use-case';

@ApiTags('simulations')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
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
    @Body() request: UpsertPropertyListFinancingSettingsRequestDto,
  ): Promise<void> {
    await this.saveFinancingSettingsUseCase.execute(request);
  }

  @Post('items')
  @HttpCode(HttpStatus.NO_CONTENT)
  async addProperty(@Body() request: AddPropertyToListRequestDto): Promise<void> {
    await this.addPropertyToListUseCase.execute(request);
  }

  @Get('items')
  @HttpCode(HttpStatus.OK)
  async getListState(): Promise<GetPropertyListStateResponseDto> {
    return this.getPropertyListStateUseCase.execute();
  }

  @Delete('items/:propertyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProperty(@Param('propertyId') propertyId: string): Promise<void> {
    await this.removePropertyFromListUseCase.execute(propertyId);
  }
}
