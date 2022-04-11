import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { Profession } from '../../profession.entity';

export class ProfessionsSelectPresenter {
  constructor(
    private readonly allProfessions: Profession[],
    private readonly selectedProfession: Profession | null,
  ) {}

  selectArgs(): SelectItemArgs[] {
    const options = [
      {
        text: '--- Please Select ---',
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
