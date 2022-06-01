import { Profession } from '../../profession.entity';
import { ProfessionVersion } from '../../profession-version.entity';
import { ProfessionToOrganisation } from '../../profession-to-organisation.entity';
import { UserPermission } from '../../../users/user-permission';
import { getPermissionsFromUser } from '../../../users/helpers/get-permissions-from-user.helper';

import { escape } from '../../../helpers/escape.helper';
import {
  SummaryList,
  SummaryListActionItem,
  SummaryListItem,
} from '../../../common/interfaces/summary-list';
import { I18nService } from 'nestjs-i18n';
import { User } from '../../../users/user.entity';

export class ProfessionToOrganisationsPresenter {
  constructor(
    private readonly profession: Profession,
    private readonly professionVersion: ProfessionVersion,
    private readonly i18nService: I18nService,
    private readonly user: User,
  ) {}

  public summaryLists(): SummaryList[] {
    if (this.profession.professionToOrganisations.length) {
      return this.profession.professionToOrganisations.map(
        (professionToOrganisation, index) =>
          this.summaryList(professionToOrganisation, index),
      );
    } else {
      return [this.emptySummaryList()];
    }
  }

  private summaryList(
    professionToOrganisation: ProfessionToOrganisation,
    index: number,
  ): SummaryList {
    return {
      attributes: {
        'data-cy': `profession-to-organisation-${index + 1}`,
      },
      rows: [
        this.summaryListItem(
          this.i18nService.translate<string>(
            'professions.form.label.organisations.name',
          ),
          escape(professionToOrganisation.organisation.name),
          escape(professionToOrganisation.organisation.name),
        ),
        this.summaryListItem(
          this.i18nService.translate<string>(
            'professions.form.label.organisations.role',
          ),
          this.i18nService.translate<string>(
            `organisations.label.roles.${professionToOrganisation.role}`,
          ),
          escape(professionToOrganisation.organisation.name),
        ),
      ],
    };
  }

  private emptySummaryList(): SummaryList {
    return {
      rows: [
        this.summaryListItem(
          this.i18nService.translate<string>(
            'professions.form.label.organisations.name',
          ),
          '',
          this.i18nService.translate<string>(
            'professions.form.label.topLevelInformation.regulatedAuthorities',
          ),
        ),
        this.summaryListItem(
          this.i18nService.translate<string>(
            'professions.form.label.organisations.role',
          ),
          '',
          this.i18nService.translate<string>(
            'professions.form.label.topLevelInformation.regulatedAuthorities',
          ),
        ),
      ],
    };
  }

  private summaryListItem(
    key: string,
    value: string,
    visuallyHiddenText: string,
  ): SummaryListItem {
    const item = {
      key: {
        text: key,
      },
      value: {
        text: value,
      },
    };

    if (this.userCanChangeOrganisations()) {
      item['actions'] = {
        items: [this.actionsColumn(visuallyHiddenText)],
      };
    }

    return item;
  }

  private actionsColumn(visuallyHiddenText: string): SummaryListActionItem {
    return {
      href: `/admin/professions/${this.profession.id}/versions/${this.professionVersion.id}/organisations/edit?change=true`,
      text: this.i18nService.translate<string>('app.change'),
      visuallyHiddenText: visuallyHiddenText,
    };
  }

  private userCanChangeOrganisations(): boolean {
    return getPermissionsFromUser(this.user).includes(
      UserPermission.CreateProfession,
    );
  }
}
