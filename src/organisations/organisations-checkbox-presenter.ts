import { CheckboxArgs } from '../common/interfaces/checkbox-args.interface';
import { OrganisationsSorter } from './helpers/organisations-sorter';
import { Organisation } from './organisation.entity';

export class OrganisationsCheckboxPresenter {
  constructor(
    private readonly allOrganisations: Organisation[],
    private readonly checkedOrganisations: Organisation[],
  ) {}

  checkboxArgs(): CheckboxArgs[] {
    const organisations = new OrganisationsSorter(
      this.allOrganisations,
    ).sortByName();

    return organisations.map((organisation) => ({
      text: organisation.name,
      value: organisation.id,
      checked: !!this.checkedOrganisations.find(
        (checkedOrganisation) => checkedOrganisation.id === organisation.id,
      ),
    }));
  }
}
