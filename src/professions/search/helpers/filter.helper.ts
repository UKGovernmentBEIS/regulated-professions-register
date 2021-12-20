import { Industry } from '../../../industries/industry.entity';
import { Profession } from '../../../professions/profession.entity';
import { FilterInput } from '../interfaces/filter-input.interface';

export class FilterHelper {
  constructor(private readonly allProfessions: Profession[]) {}

  filter(filterInput: FilterInput): Profession[] {
    const unfilteredProfessions = this.allProfessions;

    const nationFilteredProfessions = this.filterByNation(
      filterInput,
      unfilteredProfessions,
    );

    const industryFilteredProfessions = this.filterByIndustry(
      filterInput,
      nationFilteredProfessions,
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
    if (filterInput.nations.length === 0) {
      return professions;
    } else {
      const filterNationCodes = filterInput.nations.map(
        (nation) => nation.code,
      );

      return professions.filter((profession) =>
        this.isNationOverlap(profession.occupationLocations, filterNationCodes),
      );
    }
  }

  private filterByIndustry(
    filterInput: FilterInput,
    professions: Profession[],
  ): Profession[] {
    if (filterInput.industries.length == 0) {
      return professions;
    } else {
      return professions.filter((profession) =>
        this.isIndustryOverlap(profession.industries, filterInput.industries),
      );
    }
  }

  private filterByKeyword(
    filterInput: FilterInput,
    professions: Profession[],
  ): Profession[] {
    const searchTerms = this.getSearchTerms(filterInput);

    if (searchTerms.length === 0) {
      return professions;
    } else {
      return professions.filter((profession) =>
        this.matchesKeywords(profession, searchTerms),
      );
    }
  }

  private isNationOverlap(
    nationCodes1: string[],
    nationCodes2: string[],
  ): boolean {
    return nationCodes1.some((code) => nationCodes2.includes(code));
  }

  private isIndustryOverlap(
    industries1: Industry[],
    industries2: Industry[],
  ): boolean {
    return industries1.some((industry1) => {
      return industries2.some((industry2) => industry1.id == industry2.id);
    });
  }

  private getSearchTerms(filterInput: FilterInput): string[] {
    return filterInput.keywords
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
