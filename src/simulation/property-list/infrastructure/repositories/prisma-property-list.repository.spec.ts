import { PrismaPropertyListRepository } from './prisma-property-list.repository';
import { PrismaService } from '../../../../core/database/prisma.service';
import { PropertyTrackingStatus, PropertyType } from '../../domain/property-list.types';

describe('PrismaPropertyListRepository', () => {
  it('saves financing settings through the singleton state', async () => {
    const prisma = {
      propertyListState: {
        upsert: jest.fn().mockResolvedValue(undefined),
      },
    } as unknown as PrismaService;

    const repository = new PrismaPropertyListRepository(prisma);

    await repository.saveFinancingSettings({
      annualRatePercent: 3.6,
      durationMonths: 300,
      downPayment: 10000,
      annualHouseholdIncome: 72000,
      monthlyCurrentDebtPayments: 500,
    });

    expect(prisma.propertyListState.upsert).toHaveBeenCalledTimes(1);
  });

  it('maps persisted properties back to domain objects', async () => {
    const prisma = {
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

    await expect(repository.listProperties()).resolves.toEqual([
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

  it('returns whether a property was deleted', async () => {
    const prisma = {
      propertyListItem: {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaService;

    const repository = new PrismaPropertyListRepository(prisma);

    await expect(repository.removeProperty('p-1')).resolves.toBe(true);
  });
});