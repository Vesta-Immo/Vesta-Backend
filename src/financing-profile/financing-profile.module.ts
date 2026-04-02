// filepath: src/financing-profile/financing-profile.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from '../core/database/database.module';
import { SecurityModule } from '../core/security/security.module';
import { ProjectModule } from '../project/project.module';

// Repositories
import {
  FINANCING_PROFILE_REPOSITORY,
  USER_PREFERENCES_REPOSITORY,
} from './domain/financing-profile.repository';
import {
  PrismaFinancingProfileRepository,
  PrismaUserPreferencesRepository,
} from './infrastructure/repositories/prisma-financing-profile.repository';

// Use Cases
import { CreateProfileFromScenarioUseCase } from './application/use-cases/create-profile-from-scenario.use-case';
import { UpdateProfileFromScenarioUseCase } from './application/use-cases/update-profile-from-scenario.use-case';
import { SetActiveProfileUseCase } from './application/use-cases/set-active-profile.use-case';
import { DeleteProfileUseCase } from './application/use-cases/delete-profile.use-case';
import { GetProfilesUseCase } from './application/use-cases/get-profiles.use-case';
import { GetActiveProfileUseCase } from './application/use-cases/get-active-profile.use-case';

// Services
import { ProfileSyncService } from './application/services/profile-sync.service';

// Controllers
import { FinancingProfileController } from './infrastructure/http/financing-profile.controller';

@Module({
  imports: [DatabaseModule, SecurityModule, forwardRef(() => ProjectModule)],
  controllers: [FinancingProfileController],
  providers: [
    // Repositories
    {
      provide: FINANCING_PROFILE_REPOSITORY,
      useClass: PrismaFinancingProfileRepository,
    },
    {
      provide: USER_PREFERENCES_REPOSITORY,
      useClass: PrismaUserPreferencesRepository,
    },
    PrismaFinancingProfileRepository,
    PrismaUserPreferencesRepository,

    // Use Cases
    CreateProfileFromScenarioUseCase,
    UpdateProfileFromScenarioUseCase,
    SetActiveProfileUseCase,
    DeleteProfileUseCase,
    GetProfilesUseCase,
    GetActiveProfileUseCase,

    // Services
    ProfileSyncService,
  ],
  exports: [
    // Export pour utilisation par d'autres modules
    FINANCING_PROFILE_REPOSITORY,
    USER_PREFERENCES_REPOSITORY,
    ProfileSyncService,
    GetActiveProfileUseCase,
  ],
})
export class FinancingProfileModule {}
