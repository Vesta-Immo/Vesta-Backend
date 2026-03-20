import { Injectable } from '@nestjs/common';
import {
  NotaryFeesInput,
  NotaryFeesOutput,
  PropertyType,
} from '../../domain/notary-fees.types';
import { NotaryFeesRulesService } from '../../domain/services/notary-fees-rules.service';

export { PropertyType };
export type ComputeNotaryFeesCommand = NotaryFeesInput;
export type ComputeNotaryFeesResult = NotaryFeesOutput;

@Injectable()
export class ComputeNotaryFeesUseCase {
  constructor(private readonly rulesService: NotaryFeesRulesService) {}

  execute(command: ComputeNotaryFeesCommand): ComputeNotaryFeesResult {
    return this.rulesService.compute(command);
  }
}
