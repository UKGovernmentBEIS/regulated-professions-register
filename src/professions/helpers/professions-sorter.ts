import { Profession } from '../profession.entity';

export class ProfessionsSorter {
  constructor(private readonly professions: Profession[]) {}

  sortByName(): Profession[] {
    return [...this.professions].sort((profession1, profession2) => {
      if (profession1.name < profession2.name) {
        return -1;
      } else if (profession1.name > profession2.name) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
