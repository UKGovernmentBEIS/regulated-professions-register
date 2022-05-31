import { CheckboxItems } from '../../../common/interfaces/checkbox-items.interface';
import { Profession } from '../../../professions/profession.entity';

export class ProfessionsCheckboxPresenter {
  constructor(
    private readonly professions: Profession[],
    private readonly checkedProfessions?: Profession[],
  ) {}

  checkboxItems(): CheckboxItems[] {
    return this.professions.map((profession) => ({
      value: profession.id,
      text: profession.name,
      checked:
        (this.checkedProfessions &&
          !!this.checkedProfessions.find(
            (checkedProfessionName) =>
              checkedProfessionName.id === profession.id,
          )) ||
        false,
    }));
  }
}
