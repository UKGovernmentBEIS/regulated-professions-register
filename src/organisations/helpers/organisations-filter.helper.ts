import { BaseFilterHelper } from '../../helpers/base-filter.helper';
import { Industry } from '../../industries/industry.entity';
import { Organisation } from '../organisation.entity';

export class OrganisationsFilterHelper extends BaseFilterHelper<Organisation> {
  constructor(allOrganisations: Organisation[]) {
    super(allOrganisations);
  }

  protected nationCodesFromSubject(organisation: Organisation): string[] {
    const nationCodeSet = new Set<string>();

    (organisation.professions || []).forEach((profession) => {
      (profession.occupationLocations || []).forEach((code) => {
        nationCodeSet.add(code);
      });
    });

    return [...nationCodeSet.values()];
  }

  protected organisationsFromSubject(
    organisation: Organisation,
  ): Organisation[] {
    return [organisation];
  }

  protected industriesFromSubject(organisation: Organisation): Industry[] {
    const industriesMap = new Map<string, Industry>();

    (organisation.professions || []).forEach((profession) => {
      (profession.industries || []).forEach((industry) => {
        industriesMap.set(industry.id, industry);
      });
    });

    return [...industriesMap.values()];
  }

  protected nameFromSubject(organisation: Organisation): string {
    return organisation.name || '';
  }
}
