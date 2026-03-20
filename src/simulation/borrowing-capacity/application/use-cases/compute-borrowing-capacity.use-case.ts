import { Injectable } from '@nestjs/common';
import { BorrowingCapacityFormulaService } from '../../domain/services/borrowing-capacity-formula.service';
import {
  BorrowingCapacityInput,
  BorrowingCapacityOutput,
} from '../../domain/borrowing-capacity.types';

export type ComputeBorrowingCapacityCommand = BorrowingCapacityInput;
export type ComputeBorrowingCapacityResult = BorrowingCapacityOutput;

@Injectable()
export class ComputeBorrowingCapacityUseCase {
  constructor(
    private readonly formulaService: BorrowingCapacityFormulaService,
  ) {}

  execute(
    command: ComputeBorrowingCapacityCommand,
  ): ComputeBorrowingCapacityResult {
    return this.formulaService.compute(command);
  }
}
