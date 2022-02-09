import { CheckboxItems } from '../common/interfaces/checkbox-items.interface';
import { Organisation } from './organisation.entity';

export class OrganisationsCheckboxPresenter {
  constructor(
    private readonly allOrganisations: Organisation[],
    private readonly checkedOrganisations: Organisation[],
  ) {}

  checkboxItems(): CheckboxItems[] {
    return this.allOrganisations.map((organisation) => ({
      text: organisation.name,
      value: organisation.id,
      checked: !!this.checkedOrganisations.find(
        (checkedOrganisation) => checkedOrganisation.id === organisation.id,
      ),
    }));
  }
}
