import { Industry } from '../industries/industry.entity';
import { Organisation } from '../organisations/organisation.entity';
import { FilterInput } from '../common/interfaces/filter-input.interface';

export abstract class BaseFilterHelper<TSubject> {
  constructor(private readonly allSubjects: TSubject[]) {}

  filter(filterInput: FilterInput): TSubject[] {
    const unfilteredsubjects = this.allSubjects;

    const nationFilteredSubjects = this.filterByNation(
      filterInput,
      unfilteredsubjects,
    );

    const organisationFilteredSubjects = this.filterByOrganisation(
      filterInput,
      nationFilteredSubjects,
    );

    const industryFilteredSubjects = this.filterByIndustry(
      filterInput,
      organisationFilteredSubjects,
    );

    const keywordFilteredSubjects = this.filterByKeyword(
      filterInput,
      industryFilteredSubjects,
    );

    return keywordFilteredSubjects;
  }

  protected abstract nationCodesFromSubject(subject: TSubject): string[];

  protected abstract organisationsFromSubject(
    subject: TSubject,
  ): Organisation[];

  protected abstract industriesFromSubject(subject: TSubject): Industry[];

  protected abstract nameFromSubject(subject: TSubject): string;

  private filterByNation(
    filterInput: FilterInput,
    subjects: TSubject[],
  ): TSubject[] {
    if (filterInput.nations?.length) {
      const filterNationCodes = filterInput.nations.map(
        (nation) => nation.code,
      );

      return subjects.filter((subject) =>
        this.isNationOverlap(
          this.nationCodesFromSubject(subject),
          filterNationCodes,
        ),
      );
    } else {
      return subjects;
    }
  }

  private filterByOrganisation(
    filterInput: FilterInput,
    subjects: TSubject[],
  ): TSubject[] {
    if (filterInput.organisations?.length) {
      return subjects.filter((subject) =>
        this.isOrganisationOverlap(
          this.organisationsFromSubject(subject),
          filterInput.organisations,
        ),
      );
    } else {
      return subjects;
    }
  }

  private filterByIndustry(
    filterInput: FilterInput,
    subjects: TSubject[],
  ): TSubject[] {
    if (filterInput.industries?.length) {
      return subjects.filter((subject) =>
        this.isIndustryOverlap(
          this.industriesFromSubject(subject),
          filterInput.industries,
        ),
      );
    } else {
      return subjects;
    }
  }

  private filterByKeyword(
    filterInput: FilterInput,
    subjects: TSubject[],
  ): TSubject[] {
    const searchTerms = this.getSearchTerms(filterInput);

    if (searchTerms?.length) {
      return subjects.filter((subject) =>
        this.matchesKeywords(this.nameFromSubject(subject), searchTerms),
      );
    } else {
      return subjects;
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

  private matchesKeywords(name: string, searchTerms: string[]): boolean {
    return searchTerms.some((term) => name.toLowerCase().includes(term));
  }
}
