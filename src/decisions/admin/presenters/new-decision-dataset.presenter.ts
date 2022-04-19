import { I18nService } from 'nestjs-i18n';
import { Organisation } from '../../../organisations/organisation.entity';
import { ProfessionsSelectPresenter } from '../../../professions/admin/presenters/professions-select.presenter';
import { RegulatedAuthoritiesSelectPresenter } from '../../../professions/admin/presenters/regulated-authorities-select-presenter';
import { Profession } from '../../../professions/profession.entity';
import { NewTemplate } from '../interfaces/new-template.interface';
import { YearsSelectPresenter } from './years-select.presenter';

export class NewDecisionDatasetPresenter {
  constructor(
    private readonly professions: Profession[],
    private readonly organisations: Organisation[] | null,
    private readonly startYear: number,
    private readonly endYear: number,
    private readonly selectedProfession: Profession | null,
    private readonly selectedOrganisation: Organisation | null,
    private readonly selectedYear: number | null,
    private readonly i18nService: I18nService,
  ) {}

  present(): NewTemplate {
    const professionsPresenter = new ProfessionsSelectPresenter(
      this.professions,
      this.selectedProfession,
      this.i18nService,
    );

    const organisationsPresenter =
      this.organisations &&
      new RegulatedAuthoritiesSelectPresenter(
        this.organisations,
        this.selectedOrganisation,
        null,
        this.i18nService,
      );

    const yearsPresenter = new YearsSelectPresenter(
      this.startYear,
      this.endYear,
      this.selectedYear,
      this.i18nService,
    );

    return {
      organisationsSelectArgs: organisationsPresenter?.selectArgs(),
      professionsSelectArgs: professionsPresenter.selectArgs(),
      yearsSelectArgs: yearsPresenter.selectArgs(),
    };
  }
}
