import { Injectable } from '@nestjs/common';
import { PtzRulesService } from '../../domain/services/ptz-rules.service';
import { PtzConditions } from '../../domain/ptz.types';

export type GetPtzConditionsResult = PtzConditions;

/**
 * Use case pour récupérer les conditions PTZ actuelles
 */
@Injectable()
export class GetPtzConditionsUseCase {
  constructor(private readonly rulesService: PtzRulesService) {}

  execute(): GetPtzConditionsResult {
    return this.rulesService.getConditions();
  }
}
