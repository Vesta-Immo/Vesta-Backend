import { Injectable } from '@nestjs/common';
import { PtzEligibilityService } from '../../domain/services/ptz-eligibility.service';
import { PrismaPtzRepository } from '../../infrastructure/repositories/prisma-ptz.repository';
import { PtzEligibilityInput, PtzEligibilityResult } from '../../domain/ptz.types';

export type CheckPtzEligibilityCommand = PtzEligibilityInput;
export type CheckPtzEligibilityResult = PtzEligibilityResult;

/**
 * Use case pour vérifier l'éligibilité PTZ
 */
@Injectable()
export class CheckPtzEligibilityUseCase {
  constructor(
    private readonly eligibilityService: PtzEligibilityService,
    private readonly repository: PrismaPtzRepository,
  ) {}

  async execute(command: CheckPtzEligibilityCommand): Promise<CheckPtzEligibilityResult> {
    // Check eligibility
    const result = this.eligibilityService.checkEligibility(command);

    // Save the simulation
    await this.repository.save(command, result);

    return result;
  }
}
