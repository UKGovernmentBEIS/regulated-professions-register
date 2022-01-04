import { Organisation } from '../../organisations/organisation.entity';
import { RegulatedAuthoritiesSelectPresenter } from './regulated-authorities-select-presenter';

describe(RegulatedAuthoritiesSelectPresenter, () => {
  const exampleOrganisation1 = new Organisation('Example Organisation 1');
  exampleOrganisation1.id = 'org1-id';
  const exampleOrganisation2 = new Organisation('Example Organisation 2');
  exampleOrganisation2.id = 'org2-id';

  describe('selectArgs', () => {
    it('should return no selected item when called with an empty list of selected Organisations', async () => {
      const presenter = new RegulatedAuthoritiesSelectPresenter(
        [exampleOrganisation1, exampleOrganisation2],
        null,
      );

      expect(presenter.selectArgs()).toEqual([
        {
          text: 'Example Organisation 1',
          value: 'org1-id',
          selected: false,
        },
        {
          text: 'Example Organisation 2',
          value: 'org2-id',
          selected: false,
        },
      ]);
    });

    it('should return some checked checkbox arguments when called with a non-empty list of Nations', async () => {
      const presenter = new RegulatedAuthoritiesSelectPresenter(
        [exampleOrganisation1, exampleOrganisation2],
        exampleOrganisation1,
      );

      expect(presenter.selectArgs()).toEqual([
        {
          text: 'Example Organisation 1',
          value: 'org1-id',
          selected: true,
        },
        {
          text: 'Example Organisation 2',
          value: 'org2-id',
          selected: false,
        },
      ]);
    });
  });
});
