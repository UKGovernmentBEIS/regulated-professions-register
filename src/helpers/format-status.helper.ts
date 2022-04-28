import { I18nService } from 'nestjs-i18n';
import { DecisionDatasetStatus } from '../decisions/decision-dataset.entity';
import { OrganisationVersionStatus } from '../organisations/organisation-version.entity';
import { ProfessionVersionStatus } from '../professions/profession-version.entity';

export function formatStatus(
  status:
    | ProfessionVersionStatus
    | OrganisationVersionStatus
    | DecisionDatasetStatus,
  i18nSerice: I18nService,
): string {
  let colourClass: string;

  if (
    status === ProfessionVersionStatus.Archived ||
    status === OrganisationVersionStatus.Archived
  ) {
    colourClass = 'govuk-tag--grey';
  } else if (
    status === ProfessionVersionStatus.Draft ||
    status === OrganisationVersionStatus.Draft ||
    status === DecisionDatasetStatus.Draft
  ) {
    colourClass = 'govuk-tag--yellow';
  } else if (
    status === ProfessionVersionStatus.Live ||
    status === OrganisationVersionStatus.Live ||
    status === DecisionDatasetStatus.Live
  ) {
    colourClass = 'govuk-tag--turquoise';
  } else {
    return '';
  }

  const text = i18nSerice.translate(`app.status.${status}`);

  return `<strong class="govuk-tag ${colourClass}">${text}</strong>`;
}
