import { Organisation } from '../organisation.entity';

export class OrganisationsSorter {
  constructor(private readonly organisations: Organisation[]) {}

  sortByName(): Organisation[] {
    return [...this.organisations].sort((organisation1, organisation2) => {
      if (organisation1.name < organisation2.name) {
        return -1;
      } else if (organisation1.name > organisation2.name) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
