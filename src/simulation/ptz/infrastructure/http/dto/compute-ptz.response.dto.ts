import { ApiProperty } from '@nestjs/swagger';

export class PtzDurationInfoDto {
  @ApiProperty({ example: 300, description: 'Durée totale en mois' })
  totalDurationMonths!: number;

  @ApiProperty({ example: 180, description: 'Période de différé en mois' })
  deferredPeriodMonths!: number;

  @ApiProperty({ example: 120, description: 'Période de remboursement en mois' })
  repaymentPeriodMonths!: number;

  @ApiProperty({ example: 45, description: 'RFR en % du plafond' })
  rfrPercentage!: number;
}

export class ComputePtzResponseDto {
  @ApiProperty({ example: true, description: 'Éligibilité au PTZ' })
  isEligible!: boolean;

  @ApiProperty({ example: [], description: 'Raisons de non-éligibilité le cas échéant', required: false })
  reasons?: string[];

  @ApiProperty({ example: 100000, description: 'Montant maximum PTZ en euros' })
  maxPtzAmount!: number;

  @ApiProperty({ example: 0, description: 'Taux PTZ en basis points (0 pour PTZ)' })
  ptzRate!: number;

  @ApiProperty({ example: 300, description: 'Durée PTZ en mois' })
  ptzDuration!: number;

  @ApiProperty({ example: 40, description: 'Pourcentage de financement appliqué' })
  loanPercentage!: number;

  @ApiProperty({ type: PtzDurationInfoDto, description: 'Informations sur la durée et le différé', required: false })
  durationInfo?: PtzDurationInfoDto;
}
