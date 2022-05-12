import { ProfessionVersionStatus } from '../../professions/profession-version.entity';
import { Profession } from '../../professions/profession.entity';
import { OrganisationVersion } from '../organisation-version.entity';
import { getProfessionsFromOrganisation } from './get-professions-from-organisation.helper';

export function getLiveAndDraftProfessionsFromOrganisation(
  version: OrganisationVersion,
): Profession[] {
  const professions = getProfessionsFromOrganisation(version.organisation);

  return professions.filter((profession) =>
    profession.versions.some((professionVersion) =>
      [ProfessionVersionStatus.Draft, ProfessionVersionStatus.Live].includes(
        professionVersion.status,
      ),
    ),
  );
}
