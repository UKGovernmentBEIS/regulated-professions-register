import { I18nService } from 'nestjs-i18n';
import { ProfessionPresenter } from '../../professions/presenters/profession.presenter';
import { ShowTemplate } from '../admin/interfaces/show-template.interface';
import { Organisation } from '../organisation.entity';
import { OrganisationPresenter } from './organisation.presenter';

export class OrganisationSummaryPresenter {
  constructor(
    private readonly organisation: Organisation,
    private readonly backLink: string,
    private readonly i18nService: I18nService,
  ) {}

  async present(): Promise<ShowTemplate> {
    const organisationPresenter = new OrganisationPresenter(
      this.organisation,
      this.i18nService,
    );

    if (this.organisation.professions === undefined) {
      throw new Error(
        'You must eagerly load professions to show professions. Try calling a "WithProfessions" method on the `OrganisationsService` class',
      );
    }

    const professionPresenters = this.organisation.professions.map(
      (profession) => new ProfessionPresenter(profession, this.i18nService),
    );

    return {
      organisation: this.organisation,
      summaryList: await organisationPresenter.summaryList({
        removeBlank: true,
      }),
      professions: await Promise.all(
        professionPresenters.map(async (presenter) => {
          return {
            name: presenter.profession.name,
            slug: presenter.profession.slug,
            summaryList: await presenter.summaryList(),
          };
        }),
      ),
      backLink: this.backLink,
    };
  }
}
