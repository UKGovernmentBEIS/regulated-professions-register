import { FilterInput } from '../common/interfaces/filter-input.interface';
import { DecisionDatasetStatus } from '../decisions/decision-dataset.entity';
import { Industry } from '../industries/industry.entity';
import { Nation } from '../nations/nation';
import { Organisation } from '../organisations/organisation.entity';
import { Profession } from '../professions/profession.entity';
import { RegulationType } from '../professions/profession-version.entity';

type AllOrNone<T> = T | { [K in keyof T]?: never };

export function createFilterInput(
  filter: { keywords: string } & AllOrNone<{
    nations?: string[];
    allNations: Nation[];
  }> &
    AllOrNone<{ organisations?: string[]; allOrganisations: Organisation[] }> &
    AllOrNone<{ professions?: string[]; allProfessions: Profession[] }> &
    AllOrNone<{ industries?: string[]; allIndustries: Industry[] }> & {
      regulationTypes?: RegulationType[];
      years?: string[];
      statuses?: DecisionDatasetStatus[];
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

  const professions = filter.allProfessions
    ? filter.allProfessions.filter((profession) =>
        (filter.professions || []).includes(profession.id),
      )
    : undefined;

  const industries = filter.allIndustries
    ? filter.allIndustries.filter((industry) =>
        (filter.industries || []).includes(industry.id),
      )
    : undefined;

  const years = filter.years
    ? filter.years.map((yearString) => parseInt(yearString))
    : undefined;

  return {
    keywords: filter.keywords,
    nations,
    organisations,
    industries,
    regulationTypes: filter.regulationTypes,
    years,
    statuses: filter.statuses,
    professions,
  };
}
