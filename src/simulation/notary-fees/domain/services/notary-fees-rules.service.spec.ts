import { NotaryFeesRulesService } from './notary-fees-rules.service';
import { PropertyType } from '../notary-fees.types';

describe('NotaryFeesRulesService', () => {
  const service = new NotaryFeesRulesService();

  it('applies old property base rate', () => {
    const result = service.compute({
      propertyPrice: 280000,
      propertyType: PropertyType.OLD,
    });

    expect(result.appliedRatePercent).toBe(7.8);
    expect(result.notaryFees).toBe(21840);
  });

  it('applies surcharge for specific departments', () => {
    const result = service.compute({
      propertyPrice: 280000,
      propertyType: PropertyType.OLD,
      departmentCode: '75',
    });

    expect(result.appliedRatePercent).toBe(8);
    expect(result.notaryFees).toBe(22400);
  });

  it('does not apply surcharge for new properties', () => {
    const result = service.compute({
      propertyPrice: 280000,
      propertyType: PropertyType.NEW,
      departmentCode: '75',
    });

    expect(result.appliedRatePercent).toBe(2.8);
    expect(result.notaryFees).toBe(7840);
  });
});
