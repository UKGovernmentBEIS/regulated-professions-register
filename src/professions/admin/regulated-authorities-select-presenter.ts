import { SelectItemArgs } from '../../common/interfaces/select-item-args.interface';
import { Organisation } from '../../organisations/organisation.entity';

export class RegulatedAuthoritiesSelectPresenter {
  constructor(
    private readonly allOrganisations: Organisation[],
    private readonly selectedOrganisation: Organisation | null,
  ) {}

  selectArgs(): SelectItemArgs[] {
    return this.allOrganisations.map((organisation) => ({
      text: organisation.name,
      value: organisation.id,
      selected: this.selectedOrganisation
        ? this.selectedOrganisation.id === organisation.id
        : false,
    }));
  }
}
