import { I18nService } from 'nestjs-i18n';
import { ProfessionPresenter } from '../../professions/presenters/profession.presenter';
import { ShowTemplate } from '../interfaces/show-template.interface';
import { Organisation } from '../organisation.entity';
import { OrganisationPresenter } from './organisation.presenter';

export class OrganisationSummaryPresenter {
  constructor(
    private readonly organisation: Organisation,
    private readonly i18nService: I18nService,
  ) {}

  async present(showEmptyFields: boolean): Promise<ShowTemplate> {
    const organisationPresenter = new OrganisationPresenter(
      this.organisation,
      this.i18nService,
    );

    if (this.organisation.professions === undefined) {
      throw new Error(
        'You must eagerly load professions to show professions. Try calling a "WithProfessions" method on the `OrganisationsService` class',
      );
    }

    const professionPresenters = this.organisation.professions
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
      professions: await Promise.all(
        professionPresenters.map(async (presenter) => {
          return {
            name: presenter.profession.name,
            slug: presenter.profession.slug,
            id: presenter.profession.id,
            versionId: presenter.profession.versionId,
            summaryList: await presenter.summaryList(),
          };
        }),
      ),
    };
  }
}
