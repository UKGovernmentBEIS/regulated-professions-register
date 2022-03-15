import { FilterInput } from '../common/interfaces/filter-input.interface';
import { Industry } from '../industries/industry.entity';
import { Nation } from '../nations/nation';
import { Organisation } from '../organisations/organisation.entity';
import { RegulationType } from '../professions/profession-version.entity';

type AllOrNone<T> = T | { [K in keyof T]?: never };

export function createFilterInput(
  filter: { keywords: string } & AllOrNone<{
    nations?: string[];
    allNations: Nation[];
  }> &
    AllOrNone<{ organisations?: string[]; allOrganisations: Organisation[] }> &
    AllOrNone<{ industries?: string[]; allIndustries: Industry[] }> & {
      regulationTypes?: RegulationType[];
    },
): FilterInput {
  const nations = filter.allNations
    ? filter.allNations.filter((nation) => filter.nations.includes(nation.code))
    : undefined;

  const organisations = filter.allOrganisations
    ? filter.allOrganisations.filter((organisation) =>
        (filter.organisations || []).includes(organisation.id),
      )
    : undefined;

  const industries = filter.allIndustries
    ? filter.allIndustries.filter((industry) =>
        (filter.industries || []).includes(industry.id),
      )
    : undefined;

  return {
    keywords: filter.keywords,
    nations,
    organisations,
    industries,
    regulationTypes: filter.regulationTypes,
  };
}
