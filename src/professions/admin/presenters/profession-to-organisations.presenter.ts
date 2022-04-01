import { Profession } from '../../profession.entity';
import { ProfessionVersion } from '../../profession-version.entity';
import { ProfessionToOrganisation } from '../../profession-to-organisation.entity';

import { escape } from '../../../helpers/escape.helper';
import {
  SummaryList,
  SummaryListActionItem,
  SummaryListItem,
} from '../../../common/interfaces/summary-list';
import { I18nService } from 'nestjs-i18n';

export class ProfessionToOrganisationsPresenter {
  constructor(
    private readonly profession: Profession,
    private readonly professionVersion: ProfessionVersion,
    private readonly i18nService: I18nService,
  ) {}

  public async summaryLists(): Promise<SummaryList[]> {
    if (this.profession.professionToOrganisations.length) {
      return await Promise.all(
        this.profession.professionToOrganisations.map(
          async (professionToOrganisation, index) =>
            this.summaryList(professionToOrganisation, index),
        ),
      );
    } else {
      return [await this.emptySummaryList()];
    }
  }

  private async summaryList(
    professionToOrganisation: ProfessionToOrganisation,
    index: number,
  ): Promise<SummaryList> {
    return {
      attributes: {
        'data-cy': `profession-to-organisation-${index + 1}`,
      },
      rows: [
        await this.summaryListItem(
          await this.i18nService.translate(
            'professions.form.label.organisations.name',
          ),
          escape(professionToOrganisation.organisation.name),
          escape(professionToOrganisation.organisation.name),
        ),
        await this.summaryListItem(
          await this.i18nService.translate(
            'professions.form.label.organisations.role',
          ),
          await this.i18nService.translate(
            `organisations.label.roles.${professionToOrganisation.role}`,
          ),
          escape(professionToOrganisation.organisation.name),
        ),
      ],
    };
  }

  private async actionsColumn(
    visuallyHiddenText: string,
  ): Promise<SummaryListActionItem> {
    return {
      href: `/admin/professions/${this.profession.id}/versions/${this.professionVersion.id}/organisations/edit?change=true`,
      text: await this.i18nService.translate('app.change'),
      visuallyHiddenText: visuallyHiddenText,
    };
  }

  private async summaryListItem(
    key: string,
    value: string,
    visuallyHiddenText: string,
  ): Promise<SummaryListItem> {
    return {
      key: {
        text: key,
      },
      value: {
        text: value,
      },
      actions: {
        items: [await this.actionsColumn(visuallyHiddenText)],
      },
    };
  }

  private async emptySummaryList(): Promise<SummaryList> {
    return {
      rows: [
        await this.summaryListItem(
          await this.i18nService.translate(
            'professions.form.label.organisations.name',
          ),
          '',
          await this.i18nService.translate(
            'professions.form.label.topLevelInformation.regulatedAuthorities',
          ),
        ),
        await this.summaryListItem(
          await this.i18nService.translate(
            'professions.form.label.organisations.role',
          ),
          '',
          await this.i18nService.translate(
            'professions.form.label.topLevelInformation.regulatedAuthorities',
          ),
        ),
      ],
    };
  }
}
