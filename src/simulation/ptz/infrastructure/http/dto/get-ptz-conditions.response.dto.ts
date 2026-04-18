import { ApiProperty } from '@nestjs/swagger';
import { PtzZone } from '../../../domain/ptz.types';

class PtzPlafondDto {
  @ApiProperty({ example: 'A', enum: PtzZone, description: 'Zone géographique' })
  zone!: PtzZone;

  @ApiProperty({ example: 3, description: 'Nombre de personnes dans le foyer' })
  householdSize!: number;

  @ApiProperty({ example: 13000000, description: 'Prix maximum du logement en centimes' })
  maxPropertyPrice!: number;

  @ApiProperty({ example: 40, description: 'Pourcentage de financement maximum' })
  maxLoanPercentage!: number;

  @ApiProperty({ example: 7600000, description: 'RFR maximum en centimes' })
  maxRfr!: number;
}

export class GetPtzConditionsResponseDto {
  @ApiProperty({ type: [PtzPlafondDto], description: 'Plafonds PTZ par zone et taille du foyer' })
  plafonds!: PtzPlafondDto[];

  @ApiProperty({ example: 25, description: 'Pourcentage minimum de travaux pour un bien ancien' })
  minWorkPercentage!: number;

  @ApiProperty({ example: 0, description: 'Taux PTZ en basis points (0 pour taux zéro)' })
  ptzRate!: number;

  @ApiProperty({ example: 300, description: 'Durée maximale PTZ en mois' })
  maxDurationMonths!: number;
}
