import { OrganisationVersionStatus } from '../../organisations/organisation-version.entity';
import { Organisation } from '../../organisations/organisation.entity';
import { ProfessionVersion } from '../profession-version.entity';
import { getOrganisationsFromProfession } from './get-organisations-from-profession.helper';

type Section =
  | 'scope'
  | 'regulatedActivities'
  | 'qualifications'
  | 'legislation';

interface IncompleteSectionPublicationBlocker {
  type: 'incomplete-section';
  section: Section;
}

interface OrganisationNotLivePublicationBlocker {
  type: 'organisation-not-live';
  organisation: Organisation;
}

export type PublicationBlocker =
  | IncompleteSectionPublicationBlocker
  | OrganisationNotLivePublicationBlocker;

export function getPublicationBlockers(
  version: ProfessionVersion,
): PublicationBlocker[] {
  const blockers: PublicationBlocker[] = [];

  const organisations = getOrganisationsFromProfession(version.profession);

  if (organisations?.length) {
    for (const organisation of organisations) {
      if (!hasLiveVersion(organisation)) {
        blockers.push({
          type: 'organisation-not-live',
          organisation: organisation,
        });
      }
    }
  }

  if (!version.industries?.length || !version.occupationLocations?.length) {
    blockers.push({ type: 'incomplete-section', section: 'scope' });
  }

  if (
    !version.description ||
    !version.regulationType ||
    !version.reservedActivities
  ) {
    blockers.push({
      type: 'incomplete-section',
      section: 'regulatedActivities',
    });
  }

  if (
    !version.qualification?.routesToObtain ||
    !version.qualification?.otherCountriesRecognitionRoutes
  ) {
    blockers.push({ type: 'incomplete-section', section: 'qualifications' });
  }

  if (!version.legislations?.[0]?.name) {
    blockers.push({ type: 'incomplete-section', section: 'legislation' });
  }

  return blockers;
}

function hasLiveVersion(organisation: Organisation): boolean {
  return organisation.versions?.some(
    (version) => version.status === OrganisationVersionStatus.Live,
  );
}
