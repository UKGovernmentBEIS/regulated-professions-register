import professionVersionFactory from '../../testutils/factories/profession-version';
import { sortProfessionVersionsByLastUpdated } from './sort-profession-versions-by-last-updated.helper';

describe('sortProfessionVersionsByLastUpdated', () => {
  it('returns profession versions sorted by last updated time', () => {
    const version1 = professionVersionFactory.build({
      updated_at: new Date(2021, 4, 23),
    });

    const version2 = professionVersionFactory.build({
      updated_at: new Date(2022, 9, 4),
    });

    const version3 = professionVersionFactory.build({
      updated_at: new Date(2022, 2, 18),
    });

    const result = sortProfessionVersionsByLastUpdated([
      version1,
      version2,
      version3,
    ]);

    expect(result).toEqual([version2, version3, version1]);
  });
});
