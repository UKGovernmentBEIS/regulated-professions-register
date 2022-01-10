import { OrganisationsSorter } from './organisations-sorter';
import organisationFactory from '../../testutils/factories/organisation';

const organisationA = organisationFactory.build({ name: 'A' });
const organisationB = organisationFactory.build({ name: 'B' });
const organisationC = organisationFactory.build({ name: 'C' });

describe('OrganisationsSorter', () => {
  it('successfully sorts an empty list', () => {
    const sorter = new OrganisationsSorter([]);

    expect(sorter.sortByName()).toEqual([]);
  });

  it('sorts organisations alphabetically by name', () => {
    const sorter = new OrganisationsSorter([
      organisationC,
      organisationA,
      organisationB,
    ]);

    expect(sorter.sortByName()).toEqual([
      organisationA,
      organisationB,
      organisationC,
    ]);
  });

  it('does not modify the input list', () => {
    const input = [organisationC, organisationB, organisationA];

    const sorter = new OrganisationsSorter(input);

    expect(sorter.sortByName()).toEqual([
      organisationA,
      organisationB,
      organisationC,
    ]);
    expect(input).toEqual([organisationC, organisationB, organisationA]);
  });

  it('terminates when given a list of identical organisations', () => {
    const input = [organisationA, organisationA, organisationA];

    const sorter = new OrganisationsSorter(input);

    expect(sorter.sortByName()).toEqual([
      organisationA,
      organisationA,
      organisationA,
    ]);
  });
});
