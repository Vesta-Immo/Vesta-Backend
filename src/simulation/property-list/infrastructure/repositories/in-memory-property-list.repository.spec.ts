import { InMemoryPropertyListRepository } from './in-memory-property-list.repository';
import { PropertyTrackingStatus, PropertyType } from '../../domain/property-list.types';

describe('InMemoryPropertyListRepository', () => {
  it('stores financing settings and properties in memory', () => {
    const repository = new InMemoryPropertyListRepository();

    repository.saveFinancingSettings({
      annualRatePercent: 3.6,
      durationMonths: 300,
      downPayment: 10000,
      annualHouseholdIncome: 72000,
      monthlyCurrentDebtPayments: 500,
    });

    repository.addProperty({
      id: 'p-1',
      status: PropertyTrackingStatus.WANTED,
      propertyType: PropertyType.OLD,
      listingUrl: 'https://www.example.com/annonce/p-1',
      price: 250000,
      addressOrSector: 'Lille centre',
      propertyTaxAnnual: 1200,
      coOwnershipFeesAnnual: 1600,
      renovationWorkItems: [{ name: 'Kitchen', cost: 12000 }],
    });

    expect(repository.getFinancingSettings()).toEqual({
      annualRatePercent: 3.6,
      durationMonths: 300,
      downPayment: 10000,
      annualHouseholdIncome: 72000,
      monthlyCurrentDebtPayments: 500,
    });
    expect(repository.listProperties()).toHaveLength(1);
    expect(repository.listProperties()[0].listingUrl).toBe(
      'https://www.example.com/annonce/p-1',
    );
  });

  it('stores and returns last simulation snapshot', () => {
    const repository = new InMemoryPropertyListRepository();

    repository.saveLastSimulation({
      annualRatePercent: 3.6,
      durationMonths: 300,
      downPayment: 10000,
      annualHouseholdIncome: 72000,
      monthlyCurrentDebtPayments: 500,
      results: [],
    });

    expect(repository.getLastSimulation()).toEqual({
      annualRatePercent: 3.6,
      durationMonths: 300,
      downPayment: 10000,
      annualHouseholdIncome: 72000,
      monthlyCurrentDebtPayments: 500,
      results: [],
    });
  });

  it('replaces property when id already exists', () => {
    const repository = new InMemoryPropertyListRepository();

    repository.addProperty({
      id: 'p-1',
      status: PropertyTrackingStatus.WANTED,
      propertyType: PropertyType.OLD,
      price: 250000,
      addressOrSector: 'Lille centre',
      propertyTaxAnnual: 1200,
      coOwnershipFeesAnnual: 1600,
      renovationWorkItems: [{ name: 'Kitchen', cost: 12000 }],
    });

    repository.addProperty({
      id: 'p-1',
      status: PropertyTrackingStatus.VISITED,
      propertyType: PropertyType.NEW,
      price: 245000,
      addressOrSector: 'Lille centre',
      propertyTaxAnnual: 1000,
      coOwnershipFeesAnnual: 1400,
      renovationWorkItems: [],
    });

    const properties = repository.listProperties();
    expect(properties).toHaveLength(1);
    expect(properties[0].status).toBe(PropertyTrackingStatus.VISITED);
    expect(properties[0].price).toBe(245000);
  });

  it('removes a property by id', () => {
    const repository = new InMemoryPropertyListRepository();

    repository.addProperty({
      id: 'p-1',
      status: PropertyTrackingStatus.WANTED,
      propertyType: PropertyType.OLD,
      price: 250000,
      addressOrSector: 'Lille centre',
      propertyTaxAnnual: 1200,
      coOwnershipFeesAnnual: 1600,
      renovationWorkItems: [],
    });

    expect(repository.removeProperty('p-1')).toBe(true);
    expect(repository.removeProperty('unknown')).toBe(false);
    expect(repository.listProperties()).toHaveLength(0);
  });
});
