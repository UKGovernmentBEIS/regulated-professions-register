import { ProfessionsSorter } from './professions-sorter';
import professionFactory from '../../testutils/factories/profession';

const professionA = professionFactory.build({ name: 'A' });
const professionB = professionFactory.build({ name: 'B' });
const professionC = professionFactory.build({ name: 'C' });

describe('ProfessionsSorter', () => {
  it('successfully sorts an empty list', () => {
    const sorter = new ProfessionsSorter([]);

    expect(sorter.sortByName()).toEqual([]);
  });

  it('sorts professions alphabetically by name', () => {
    const sorter = new ProfessionsSorter([
      professionC,
      professionA,
      professionB,
    ]);

    expect(sorter.sortByName()).toEqual([
      professionA,
      professionB,
      professionC,
    ]);
  });

  it('does not modify the input list', () => {
    const input = [professionC, professionB, professionA];

    const sorter = new ProfessionsSorter(input);

    expect(sorter.sortByName()).toEqual([
      professionA,
      professionB,
      professionC,
    ]);
    expect(input).toEqual([professionC, professionB, professionA]);
  });

  it('terminates when given a list of identical professions', () => {
    const input = [professionA, professionA, professionA];

    const sorter = new ProfessionsSorter(input);

    expect(sorter.sortByName()).toEqual([
      professionA,
      professionA,
      professionA,
    ]);
  });
});
