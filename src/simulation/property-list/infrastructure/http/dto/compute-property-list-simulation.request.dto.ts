import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FinancingSettingsDto, PropertyItemDto } from './property-list-shared.dto';

export class ComputePropertyListSimulationRequestDto extends FinancingSettingsDto {
  @ApiProperty({ type: [PropertyItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PropertyItemDto)
  properties!: PropertyItemDto[];
}
