import { PrismaPropertyListRepository } from './prisma-property-list.repository';
import { PrismaService } from '../../../../core/database/prisma.service';
import { PropertyTrackingStatus, PropertyType } from '../../domain/property-list.types';

describe('PrismaPropertyListRepository', () => {
  it('saves financing settings through the user state', async () => {
    const prisma = {
      user: {
        upsert: jest.fn().mockResolvedValue({ id: 'user-db-1' }),
      },
      propertyListState: {
        upsert: jest.fn().mockResolvedValue({ id: 'state-1', userId: 'user-db-1' }),
      },
    } as unknown as PrismaService;

    const repository = new PrismaPropertyListRepository(prisma);

    await repository.saveFinancingSettings('supabase-user-1', {
      annualRatePercent: 3.6,
      durationMonths: 300,
      downPayment: 10000,
      annualHouseholdIncome: 72000,
      monthlyCurrentDebtPayments: 500,
    });

    expect(prisma.user.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.user.upsert).toHaveBeenCalledWith({
      where: { supabaseAuthUserId: 'supabase-user-1' },
      create: { supabaseAuthUserId: 'supabase-user-1' },
      update: {},
      select: { id: true },
    });
    expect(prisma.propertyListState.upsert).toHaveBeenCalledTimes(2);
  });

  it('maps persisted properties back to domain objects', async () => {
    const prisma = {
      propertyListState: {
        findFirst: jest.fn().mockResolvedValue({ id: 'state-1' }),
      },
      propertyListItem: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'p-1',
            status: 'WANTED',
            propertyType: 'OLD',
            listingUrl: 'https://www.example.com/annonce/p-1',
            departmentCode: '59',
            price: 250000,
            addressOrSector: 'Lille centre',
            propertyTaxAnnual: 1200,
            coOwnershipFeesAnnual: 1600,
            renovationWorkItems: [{ name: 'Kitchen', details: null, cost: 12000 }],
          },
        ]),
      },
    } as unknown as PrismaService;

    const repository = new PrismaPropertyListRepository(prisma);

    await expect(repository.listProperties('supabase-user-1')).resolves.toEqual([
      {
        id: 'p-1',
        status: PropertyTrackingStatus.WANTED,
        propertyType: PropertyType.OLD,
        listingUrl: 'https://www.example.com/annonce/p-1',
        departmentCode: '59',
        price: 250000,
        addressOrSector: 'Lille centre',
        propertyTaxAnnual: 1200,
        coOwnershipFeesAnnual: 1600,
        renovationWorkItems: [{ name: 'Kitchen', details: undefined, cost: 12000 }],
      },
    ]);
  });

  it('returns empty list when state does not exist', async () => {
    const prisma = {
      propertyListState: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      propertyListItem: {
        findMany: jest.fn(),
      },
    } as unknown as PrismaService;

    const repository = new PrismaPropertyListRepository(prisma);

    await expect(repository.listProperties('supabase-user-1')).resolves.toEqual([]);
    expect(prisma.propertyListItem.findMany).not.toHaveBeenCalled();
  });

  it('returns whether a property was deleted', async () => {
    const prisma = {
      propertyListState: {
        findFirst: jest.fn().mockResolvedValue({ id: 'state-1' }),
      },
      propertyListItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaService;

    const repository = new PrismaPropertyListRepository(prisma);

    await expect(repository.removeProperty('supabase-user-1', 'p-1')).resolves.toBe(true);
  });

  it('does not delete anything when user state does not exist', async () => {
    const prisma = {
      propertyListState: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      propertyListItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    } as unknown as PrismaService;

    const repository = new PrismaPropertyListRepository(prisma);

    await expect(repository.removeProperty('supabase-user-1', 'p-1')).resolves.toBe(false);
    expect(prisma.propertyListItem.deleteMany).not.toHaveBeenCalled();
  });
});