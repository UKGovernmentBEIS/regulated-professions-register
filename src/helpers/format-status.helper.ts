import { I18nService } from 'nestjs-i18n';
import { OrganisationVersionStatus } from '../organisations/organisation-version.entity';
import { ProfessionVersionStatus } from '../professions/profession-version.entity';

export async function formatStatus(
  status: ProfessionVersionStatus | OrganisationVersionStatus,
  i18nSerice: I18nService,
): Promise<string> {
  let colourClass: string;

  if (
    status === ProfessionVersionStatus.Archived ||
    status === OrganisationVersionStatus.Archived
  ) {
    colourClass = 'govuk-tag--grey';
  } else if (
    status === ProfessionVersionStatus.Draft ||
    status === OrganisationVersionStatus.Draft
  ) {
    colourClass = 'govuk-tag--yellow';
  } else if (
    status === ProfessionVersionStatus.Live ||
    status === OrganisationVersionStatus.Live
  ) {
    colourClass = 'govuk-tag--turquoise';
  } else {
    return '';
  }

  const text = await i18nSerice.translate(`app.status.${status}`);

  return `<strong class="govuk-tag ${colourClass}">${text}</strong>`;
}
