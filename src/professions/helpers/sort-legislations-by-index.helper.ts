import { Legislation } from '../../legislations/legislation.entity';

export function sortLegislationsByIndex(
  legislations: Legislation[],
): Legislation[] {
  return legislations.sort((a, b) => {
    return a.index - b.index;
  });
}
