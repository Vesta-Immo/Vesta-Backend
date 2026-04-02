// filepath: src/financing-profile/index.ts

// Domain exports
export * from './domain/financing-profile.types';
export * from './domain/financing-profile.repository';
export * from './domain/errors/financing-profile.errors';

// Application exports - Use Cases
export { CreateProfileFromScenarioUseCase } from './application/use-cases/create-profile-from-scenario.use-case';
export { UpdateProfileFromScenarioUseCase } from './application/use-cases/update-profile-from-scenario.use-case';
export { SetActiveProfileUseCase } from './application/use-cases/set-active-profile.use-case';
export { DeleteProfileUseCase } from './application/use-cases/delete-profile.use-case';
export { GetProfilesUseCase } from './application/use-cases/get-profiles.use-case';
export { GetActiveProfileUseCase } from './application/use-cases/get-active-profile.use-case';

// Application exports - Services
export { ProfileSyncService } from './application/services/profile-sync.service';

// Module
export { FinancingProfileModule } from './financing-profile.module';
