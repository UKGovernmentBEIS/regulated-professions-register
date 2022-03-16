import { BaseFilterHelper } from '../../helpers/base-filter.helper';
import { Industry } from '../../industries/industry.entity';
import { RegulationType } from '../../professions/profession-version.entity';
import { Organisation } from '../organisation.entity';

export class OrganisationsFilterHelper extends BaseFilterHelper<Organisation> {
  constructor(allOrganisations: Organisation[]) {
    super(allOrganisations);
  }

  protected nationCodesFromSubject(organisation: Organisation): string[] {
    const nationCodeSet = new Set<string>();

    if (organisation.professions === undefined) {
      throw new Error(
        'You must eagerly load professions to filter by nations. Try calling a "WithProfessions" method on the `OrganisationsService` class',
      );
    }

    organisation.professions.forEach((profession) => {
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
    if (organisation.professions === undefined) {
      throw new Error(
        'You must eagerly load professions to filter by industries. Try calling a "WithProfessions" method on the `OrganisationsService` class',
      );
    }

    const industriesMap = new Map<string, Industry>();

    organisation.professions.forEach((profession) => {
      if (profession.industries === undefined) {
        throw new Error(
          'You must eagerly load industries to filter by industries. Try calling a "WithProfessions" method on the `OrganisationsService` class',
        );
      }

      profession.industries.forEach((industry) => {
        industriesMap.set(industry.id, industry);
      });
    });

    return [...industriesMap.values()];
  }

  protected regulationTypesFromSubject(
    organisation: Organisation,
  ): RegulationType[] {
    if (organisation.professions === undefined) {
      throw new Error(
        'You must eagerly load professions to filter by regulation types. Try calling a "WithProfessions" method on the `OrganisationsService` class',
      );
    }

    const regulationTypes = organisation.professions
      .map((profession) => profession.regulationType)
      .filter((regulationType) => !!regulationType);
    const uniqueRegulationTypes = [...new Set(regulationTypes)];

    return uniqueRegulationTypes;
  }

  protected nameFromSubject(organisation: Organisation): string {
    return organisation.name || '';
  }
}
