import { CheckboxArgs } from '../common/interfaces/checkbox-args.interface';
import { Organisation } from './organisation.entity';

export class OrganisationsCheckboxPresenter {
  constructor(
    private readonly allOrganisations: Organisation[],
    private readonly checkedOrganisations: Organisation[],
  ) {}

  checkboxArgs(): CheckboxArgs[] {
    return this.allOrganisations.map((organisation) => ({
      text: organisation.name,
      value: organisation.id,
      checked: !!this.checkedOrganisations.find(
        (checkedOrganisation) => checkedOrganisation.id === organisation.id,
      ),
    }));
  }
}
