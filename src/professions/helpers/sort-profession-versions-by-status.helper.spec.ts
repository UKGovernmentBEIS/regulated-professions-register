import professionVersionFactory from '../../testutils/factories/profession-version';
import { ProfessionVersionStatus } from '../profession-version.entity';
import { sortProfessionVersionsByStatus } from './sort-profession-versions-by-status.helper';

describe('sortProfessionVersionsByStatus', () => {
  it('returns profession versions sorted by status', () => {
    const archivedVersion = professionVersionFactory.build({
      status: ProfessionVersionStatus.Archived,
    });

    const draftVersion = professionVersionFactory.build({
      status: ProfessionVersionStatus.Draft,
    });

    const liveVersion = professionVersionFactory.build({
      status: ProfessionVersionStatus.Live,
    });

    const result = sortProfessionVersionsByStatus([
      archivedVersion,
      draftVersion,
      liveVersion,
    ]);

    expect(result).toEqual([draftVersion, liveVersion, archivedVersion]);
  });
});
