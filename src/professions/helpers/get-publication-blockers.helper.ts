import { ProfessionVersion } from '../profession-version.entity';

type Section =
  | 'scope'
  | 'regulatedActivities'
  | 'qualifications'
  | 'legislation';

interface IncompleteSectionPublicationBlocker {
  type: 'incomplete-section';
  section: Section;
}

export type PublicationBlocker = IncompleteSectionPublicationBlocker;

export function getPublicationBlockers(
  profession: ProfessionVersion,
): PublicationBlocker[] {
  const blockers: PublicationBlocker[] = [];

  if (
    !profession.industries?.length ||
    !profession.occupationLocations?.length
  ) {
    blockers.push({ type: 'incomplete-section', section: 'scope' });
  }

  if (
    !profession.description ||
    !profession.regulationType ||
    !profession.reservedActivities
  ) {
    blockers.push({
      type: 'incomplete-section',
      section: 'regulatedActivities',
    });
  }

  if (!profession.qualification?.routesToObtain) {
    blockers.push({ type: 'incomplete-section', section: 'qualifications' });
  }

  if (!profession.legislations?.[0]?.name) {
    blockers.push({ type: 'incomplete-section', section: 'legislation' });
  }

  return blockers;
}
