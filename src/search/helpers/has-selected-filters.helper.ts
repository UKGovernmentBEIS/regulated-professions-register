import { FilterInput } from '../../common/interfaces/filter-input.interface';

export function hasSelectedFilters(filterInput: FilterInput): boolean {
  return (
    filterInput.keywords?.length > 0 ||
    filterInput.industries?.length > 0 ||
    filterInput.nations?.length > 0 ||
    filterInput.organisations?.length > 0 ||
    filterInput.regulationTypes?.length > 0
  );
}
