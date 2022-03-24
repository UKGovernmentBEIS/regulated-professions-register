import { OrganisationVersionStatus } from '../../organisations/organisation-version.entity';
import { Organisation } from '../../organisations/organisation.entity';
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

  if (!version.qualification?.routesToObtain) {
    blockers.push({ type: 'incomplete-section', section: 'qualifications' });
  }

  if (!version.legislations?.[0]?.name) {
    blockers.push({ type: 'incomplete-section', section: 'legislation' });
  }

  if (!hasLiveVersion(version.profession.organisation)) {
    blockers.push({
      type: 'organisation-not-live',
      organisation: version.profession.organisation,
    });
  }

  if (
    version.profession.additionalOrganisation &&
    !hasLiveVersion(version.profession.additionalOrganisation)
  ) {
    blockers.push({
      type: 'organisation-not-live',
      organisation: version.profession.additionalOrganisation,
    });
  }

  return blockers;
}

function hasLiveVersion(organisation: Organisation): boolean {
  return organisation.versions?.some(
    (version) => version.status === OrganisationVersionStatus.Live,
  );
}
