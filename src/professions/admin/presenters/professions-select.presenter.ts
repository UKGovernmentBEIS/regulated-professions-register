import { I18nService } from 'nestjs-i18n';
import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { Profession } from '../../profession.entity';

export class ProfessionsSelectPresenter {
  constructor(
    private readonly allProfessions: Profession[],
    private readonly selectedProfession: Profession | null,
    private readonly i18nService: I18nService,
  ) {}

  selectArgs(): SelectItemArgs[] {
    const options = [
      {
        text: this.i18nService.translate<string>('app.pleaseSelect') as string,
        value: '',
        selected: null,
      },
    ];

    this.allProfessions.forEach((profession) =>
      options.push({
        text: profession.name,
        value: profession.id,
        selected: this.selectedProfession
          ? this.selectedProfession.id === profession.id
          : false,
      }),
    );

    return options;
  }
}
