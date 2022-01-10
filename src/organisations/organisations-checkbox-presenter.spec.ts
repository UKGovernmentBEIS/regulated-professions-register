import { Organisation } from './organisation.entity';
import { OrganisationsCheckboxPresenter } from './organisations-checkbox-presenter';

const organisationA = new Organisation('Example Organisation A');
organisationA.id = 'example-organisation-a';

const organisationB = new Organisation('Example Organisation B');
organisationB.id = 'example-organisation-b';

const organisationC = new Organisation('Example Organisation C');
organisationC.id = 'example-organisation-c';

const organisations = [organisationA, organisationB, organisationC];

describe('OrganisationsCheckboxPresenter', () => {
  describe('checkboxArgs', () => {
    it('should return unchecked checkbox arguments when called with an empty list of Organisations', () => {
      const presenter = new OrganisationsCheckboxPresenter(organisations, []);

      expect(presenter.checkboxArgs()).toEqual([
        {
          text: 'Example Organisation A',
          value: 'example-organisation-a',
          checked: false,
        },
        {
          text: 'Example Organisation B',
          value: 'example-organisation-b',
          checked: false,
        },
        {
          text: 'Example Organisation C',
          value: 'example-organisation-c',
          checked: false,
        },
      ]);
    });

    it('should return some checked checkbox arguments when called with a non-empty list of Organisations', async () => {
      const presenter = new OrganisationsCheckboxPresenter(organisations, [
        organisationC,
        organisationA,
      ]);

      expect(presenter.checkboxArgs()).toEqual([
        {
          text: 'Example Organisation A',
          value: 'example-organisation-a',
          checked: true,
        },
        {
          text: 'Example Organisation B',
          value: 'example-organisation-b',
          checked: false,
        },
        {
          text: 'Example Organisation C',
          value: 'example-organisation-c',
          checked: true,
        },
      ]);
    });

    it('should return checkbox arguments sorted by Organisation name', async () => {
      const presenter = new OrganisationsCheckboxPresenter(
        [organisations[2], organisations[0], organisations[1]],
        [],
      );

      expect(presenter.checkboxArgs()).toEqual([
        {
          text: 'Example Organisation A',
          value: 'example-organisation-a',
          checked: false,
        },
        {
          text: 'Example Organisation B',
          value: 'example-organisation-b',
          checked: false,
        },
        {
          text: 'Example Organisation C',
          value: 'example-organisation-c',
          checked: false,
        },
      ]);
    });
  });
});
