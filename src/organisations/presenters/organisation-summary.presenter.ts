import { I18nService } from 'nestjs-i18n';
import { ProfessionPresenter } from '../../professions/presenters/profession.presenter';
import { ShowTemplate } from '../interfaces/show-template.interface';
import { Organisation } from '../organisation.entity';
import { Profession } from '../../professions/profession.entity';

import { OrganisationPresenter } from './organisation.presenter';

export class OrganisationSummaryPresenter {
  constructor(
    private readonly organisation: Organisation,
    private readonly professions: Profession[],
    private readonly i18nService: I18nService,
  ) {}

  async present(showEmptyFields: boolean): Promise<ShowTemplate> {
    const organisationPresenter = new OrganisationPresenter(
      this.organisation,
      this.i18nService,
    );

    const professionPresenters = this.professions
      .filter((profession) => profession.slug)
      .map(
        (profession) => new ProfessionPresenter(profession, this.i18nService),
      );

    return {
      organisation: this.organisation,
      presenter: organisationPresenter,
      summaryList: await organisationPresenter.summaryList({
        removeBlank: !showEmptyFields,
      }),
      professions: professionPresenters.map((presenter) => {
        return {
          name: presenter.profession.name,
          slug: presenter.profession.slug,
          id: presenter.profession.id,
          versionId: presenter.profession.versionId,
          summaryList: presenter.summaryList(),
        };
      }),
    };
  }
}
