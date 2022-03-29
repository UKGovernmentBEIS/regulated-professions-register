import { Organisation } from '../../../organisations/organisation.entity';
import { escape } from '../../../helpers/escape.helper';

export class OrganisationsPresenter {
  organisations: Organisation[];

  constructor(organisations: Organisation[]) {
    this.organisations = organisations || [];
  }

  public list(): string {
    if (this.organisations.length === 0) {
      return '';
    }

    const organisations = this.organisations
      .map((organisation) => escape(organisation.name))
      .join('<br/>');

    return `<p class="govuk-body">${organisations}</p>`;
  }
}
