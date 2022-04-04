import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { Organisation } from '../../../organisations/organisation.entity';

export class RegulatedAuthoritiesSelectPresenter {
  constructor(
    private readonly allOrganisations: Organisation[],
    private readonly selectedOrganisation: Organisation | null,
  ) {}

  selectArgs(): SelectItemArgs[] {
    const options = [
      {
        text: '--- Please Select ---',
        value: '',
        selected: null,
      },
    ];

    this.allOrganisations.forEach((organisation) =>
      options.push({
        text: organisation.name,
        value: organisation.id,
        selected: this.selectedOrganisation
          ? this.selectedOrganisation.id === organisation.id
          : false,
      }),
    );

    return options;
  }
}
