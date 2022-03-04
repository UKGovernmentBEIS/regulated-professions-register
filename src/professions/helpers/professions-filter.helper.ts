import { BaseFilterHelper } from '../../helpers/base-filter.helper';
import { Industry } from '../../industries/industry.entity';
import { Organisation } from '../../organisations/organisation.entity';
import { Profession } from '../../professions/profession.entity';
import { getOrganisationsFromProfession } from './get-organisations-from-profession.helper';

export class ProfessionsFilterHelper extends BaseFilterHelper<Profession> {
  constructor(allProfessions: Profession[]) {
    super(allProfessions);
  }

  protected nationCodesFromSubject(profession: Profession): string[] {
    return profession.occupationLocations || [];
  }

  protected organisationsFromSubject(profession: Profession): Organisation[] {
    return getOrganisationsFromProfession(profession);
  }

  protected industriesFromSubject(profession: Profession): Industry[] {
    return profession.industries || [];
  }

  protected nameFromSubject(profession: Profession): string {
    return profession.name || '';
  }
}
