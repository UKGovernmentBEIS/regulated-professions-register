import legislationFactory from '../../testutils/factories/legislation';
import { sortLegislationsByIndex } from './sort-legislations-by-index.helper';

describe('sortLegislationsByIndex', () => {
  it('returns legislations sorted by index', () => {
    const legislation0 = legislationFactory.build({ index: 0 });
    const legislation1 = legislationFactory.build({ index: 1 });
    const legislation2 = legislationFactory.build({ index: 2 });

    const result = sortLegislationsByIndex([
      legislation2,
      legislation0,
      legislation1,
    ]);

    expect(result).toEqual([legislation0, legislation1, legislation2]);
  });
});
