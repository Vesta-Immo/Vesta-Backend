// filepath: src/financing-profile/infrastructure/repositories/prisma-financing-profile.repository.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  PrismaFinancingProfileRepository,
  PrismaUserPreferencesRepository,
} from './prisma-financing-profile.repository';
import { PropertyType } from '../../../simulation/notary-fees/domain/notary-fees.types';

describe('PrismaFinancingProfileRepository', () => {
  let repository: PrismaFinancingProfileRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    supabaseAuthUserId: 'auth-user-123',
  };

  const mockProfile = {
    id: 'profile-123',
    userId: mockUser.id,
    sourceScenarioId: 'scenario-123',
    sourceProjectId: 'project-123',
    settings: {
      annualHouseholdIncome: 60000,
      monthlyCurrentDebtPayments: 500,
      annualRatePercent: 3.5,
      durationMonths: 240,
      maxDebtRatioPercent: 35,
      downPayment: 50000,
      propertyType: PropertyType.OLD,
    },
    name: 'Test Profile',
    description: null,
    isComplete: true,
    lastSyncedAt: new Date('2026-03-31'),
    createdAt: new Date('2026-03-31'),
    updatedAt: new Date('2026-03-31'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        upsert: jest.fn().mockResolvedValue(mockUser),
      },
      financingProfile: {
        create: jest.fn().mockResolvedValue(mockProfile),
        findFirst: jest.fn().mockResolvedValue(mockProfile),
        findMany: jest.fn().mockResolvedValue([mockProfile]),
        update: jest.fn().mockResolvedValue(mockProfile),
        delete: jest.fn().mockResolvedValue(undefined),
        count: jest.fn().mockResolvedValue(1),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaFinancingProfileRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaFinancingProfileRepository>(
      PrismaFinancingProfileRepository,
    );
    prismaService = module.get(PrismaService);
  });

  describe('create', () => {
    it('should create a financing profile', async () => {
      const input = {
        sourceScenarioId: 'scenario-123',
        sourceProjectId: 'project-123',
        settings: mockProfile.settings,
        name: 'Test Profile',
      };

      const result = await repository.create(mockUser.supabaseAuthUserId, input);

      expect(prismaService.user.upsert).toHaveBeenCalledWith({
        where: { supabaseAuthUserId: mockUser.supabaseAuthUserId },
        create: { supabaseAuthUserId: mockUser.supabaseAuthUserId },
        update: {},
        select: { id: true },
      });

      expect(prismaService.financingProfile.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          sourceScenarioId: input.sourceScenarioId,
          sourceProjectId: input.sourceProjectId,
          settings: input.settings,
          name: input.name,
          description: null,
          isComplete: true,
          lastSyncedAt: expect.any(Date),
        },
      });

      expect(result.id).toBe(mockProfile.id);
      expect(result.name).toBe(input.name);
    });
  });

  describe('findById', () => {
    it('should return a profile by id', async () => {
      const result = await repository.findById(mockUser.supabaseAuthUserId, 'profile-123');

      expect(prismaService.financingProfile.findFirst).toHaveBeenCalledWith({
        where: { id: 'profile-123', userId: mockUser.id },
      });

      expect(result).not.toBeNull();
      expect(result?.id).toBe(mockProfile.id);
    });

    it('should return null if profile not found', async () => {
      prismaService.financingProfile.findFirst = jest.fn().mockResolvedValue(null);

      const result = await repository.findById(mockUser.supabaseAuthUserId, 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByScenarioId', () => {
    it('should return a profile by scenario id', async () => {
      const result = await repository.findByScenarioId(
        mockUser.supabaseAuthUserId,
        'scenario-123',
      );

      expect(prismaService.financingProfile.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUser.id, sourceScenarioId: 'scenario-123' },
      });

      expect(result).not.toBeNull();
    });
  });

  describe('countByUserId', () => {
    it('should return the count of profiles for a user', async () => {
      const result = await repository.countByUserId(mockUser.supabaseAuthUserId);

      expect(prismaService.financingProfile.count).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });

      expect(result).toBe(1);
    });
  });
});

describe('PrismaUserPreferencesRepository', () => {
  let repository: PrismaUserPreferencesRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    supabaseAuthUserId: 'auth-user-123',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        upsert: jest.fn().mockResolvedValue(mockUser),
      },
      userPreferences: {
        upsert: jest.fn().mockResolvedValue({
          activeProfileId: 'profile-123',
        }),
        findUnique: jest.fn().mockResolvedValue({
          activeProfile: {
            id: 'profile-123',
            userId: mockUser.id,
            sourceScenarioId: 'scenario-123',
            sourceProjectId: 'project-123',
            settings: {},
            name: 'Active Profile',
            description: null,
            isComplete: true,
            lastSyncedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserPreferencesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserPreferencesRepository>(PrismaUserPreferencesRepository);
    prismaService = module.get(PrismaService);
  });

  describe('getPreferences', () => {
    it('should return user preferences', async () => {
      const result = await repository.getPreferences(mockUser.supabaseAuthUserId);

      expect(result.userId).toBe(mockUser.id);
      expect(result.activeProfileId).toBe('profile-123');
    });
  });

  describe('setActiveProfile', () => {
    it('should set the active profile', async () => {
      await repository.setActiveProfile(mockUser.supabaseAuthUserId, 'profile-456');

      expect(prismaService.userPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        create: { userId: mockUser.id, activeProfileId: 'profile-456' },
        update: { activeProfileId: 'profile-456' },
      });
    });
  });
});
