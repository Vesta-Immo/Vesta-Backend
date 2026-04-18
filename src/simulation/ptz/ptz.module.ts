import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database/database.module';

// Services
import { PtzRulesService } from './domain/services/ptz-rules.service';
import { PtzFormulaService } from './domain/services/ptz-formula.service';
import { PtzEligibilityService } from './domain/services/ptz-eligibility.service';

// Use cases
import { CheckPtzEligibilityUseCase } from './application/use-cases/check-ptz-eligibility.use-case';
import { ComputePtzAmountUseCase } from './application/use-cases/compute-ptz-amount.use-case';
import { GetPtzConditionsUseCase } from './application/use-cases/get-ptz-conditions.use-case';

// Repository
import { PrismaPtzRepository } from './infrastructure/repositories/prisma-ptz.repository';

// Controller
import { PtzController } from './infrastructure/http/ptz.controller';

/**
 * Module PTZ - Prêt à Taux Zéro
 * 
 * Fournit les fonctionnalités de simulation PTZ :
 * - Vérification d'éligibilité
 * - Calcul du montant PTZ
 * - Consultation des conditions et plafonds
 */
@Module({
  imports: [DatabaseModule],
  controllers: [PtzController],
  providers: [
    // Services
    PtzRulesService,
    PtzFormulaService,
    PtzEligibilityService,
    
    // Use cases
    CheckPtzEligibilityUseCase,
    ComputePtzAmountUseCase,
    GetPtzConditionsUseCase,
    
    // Repository
    PrismaPtzRepository,
  ],
  exports: [
    PtzRulesService,
    PtzFormulaService,
    PtzEligibilityService,
    CheckPtzEligibilityUseCase,
    ComputePtzAmountUseCase,
    GetPtzConditionsUseCase,
  ],
})
export class PtzModule {}
