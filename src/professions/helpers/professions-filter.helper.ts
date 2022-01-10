import { BaseFilterHelper } from '../../helpers/base-filter.helper';
import { Industry } from '../../industries/industry.entity';
import { Organisation } from '../../organisations/organisation.entity';
import { Profession } from '../../professions/profession.entity';

export class ProfessionsFilterHelper extends BaseFilterHelper<Profession> {
  constructor(allProfessions: Profession[]) {
    super(allProfessions);
  }

  protected nationCodesFromSubject(profession: Profession): string[] {
    return profession.occupationLocations || [];
  }

  protected organisationsFromSubject(profession: Profession): Organisation[] {
    return profession.organisation ? [profession.organisation] : [];
  }

  protected industriesFromSubject(profession: Profession): Industry[] {
    return profession.industries || [];
  }

  protected nameFromSubject(profession: Profession): string {
    return profession.name || '';
  }
}
