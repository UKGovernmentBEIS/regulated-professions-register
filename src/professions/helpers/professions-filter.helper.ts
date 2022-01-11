import { Industry } from '../../industries/industry.entity';
import { Organisation } from '../../organisations/organisation.entity';
import { Profession } from '../../professions/profession.entity';
import { FilterInput } from '../interfaces/filter-input.interface';

export class ProfessionsFilterHelper {
  constructor(private readonly allProfessions: Profession[]) {}

  filter(filterInput: FilterInput): Profession[] {
    const unfilteredProfessions = this.allProfessions;

    const nationFilteredProfessions = this.filterByNation(
      filterInput,
      unfilteredProfessions,
    );

    const organisationFilteredProfessions = this.filterByOrganisation(
      filterInput,
      nationFilteredProfessions,
    );

    const industryFilteredProfessions = this.filterByIndustry(
      filterInput,
      organisationFilteredProfessions,
    );

    const keywordFilteredProfessions = this.filterByKeyword(
      filterInput,
      industryFilteredProfessions,
    );

    return keywordFilteredProfessions;
  }

  private filterByNation(
    filterInput: FilterInput,
    professions: Profession[],
  ): Profession[] {
    if (filterInput.nations?.length) {
      const filterNationCodes = filterInput.nations.map(
        (nation) => nation.code,
      );

      return professions.filter((profession) =>
        this.isNationOverlap(profession.occupationLocations, filterNationCodes),
      );
    } else {
      return professions;
    }
  }

  private filterByOrganisation(
    filterInput: FilterInput,
    professions: Profession[],
  ): Profession[] {
    if (filterInput.organisations?.length) {
      return professions.filter((profession) =>
        this.isOrganisationOverlap(
          profession.organisation ? [profession.organisation] : [],
          filterInput.organisations,
        ),
      );
    } else {
      return professions;
    }
  }

  private filterByIndustry(
    filterInput: FilterInput,
    professions: Profession[],
  ): Profession[] {
    if (filterInput.industries?.length) {
      return professions.filter((profession) =>
        this.isIndustryOverlap(profession.industries, filterInput.industries),
      );
    } else {
      return professions;
    }
  }

  private filterByKeyword(
    filterInput: FilterInput,
    professions: Profession[],
  ): Profession[] {
    const searchTerms = this.getSearchTerms(filterInput);

    if (searchTerms?.length) {
      return professions.filter((profession) =>
        this.matchesKeywords(profession, searchTerms),
      );
    } else {
      return professions;
    }
  }

  private isNationOverlap(
    nationCodes1: string[],
    nationCodes2: string[],
  ): boolean {
    return nationCodes1.some((code) => nationCodes2.includes(code));
  }

  private isOrganisationOverlap(
    organisations1: Organisation[],
    organisations2: Organisation[],
  ): boolean {
    return organisations1.some((organisation1) => {
      return organisations2.some(
        (organisation2) => organisation1.id === organisation2.id,
      );
    });
  }

  private isIndustryOverlap(
    industries1: Industry[],
    industries2: Industry[],
  ): boolean {
    return industries1.some((industry1) => {
      return industries2.some((industry2) => industry1.id === industry2.id);
    });
  }

  private getSearchTerms(filterInput: FilterInput): string[] {
    return (filterInput.keywords || '')
      .toLowerCase()
      .split(' ')
      .filter((term) => term !== '');
  }

  private matchesKeywords(
    profession: Profession,
    searchTerms: string[],
  ): boolean {
    return searchTerms.some((term) =>
      profession.name.toLowerCase().includes(term),
    );
  }
}
