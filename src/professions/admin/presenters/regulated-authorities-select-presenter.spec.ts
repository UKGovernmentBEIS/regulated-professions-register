import { Organisation } from '../../../organisations/organisation.entity';
import { RegulatedAuthoritiesSelectPresenter } from './regulated-authorities-select-presenter';
import { OrganisationRole } from '../../profession-to-organisation.entity';

import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { translationOf } from '../../../testutils/translation-of';

describe(RegulatedAuthoritiesSelectPresenter, () => {
  const exampleOrganisation1 = new Organisation('Example Organisation 1');
  exampleOrganisation1.id = 'org1-id';
  const exampleOrganisation2 = new Organisation('Example Organisation 2');
  exampleOrganisation2.id = 'org2-id';

  describe('selectArgs', () => {
    it('should return no selected item when called no selected Organisation', () => {
      const presenter = new RegulatedAuthoritiesSelectPresenter(
        [exampleOrganisation1, exampleOrganisation2],
        null,
        null,
        createMockI18nService(),
      );

      expect(presenter.selectArgs()).toEqual([
        {
          text: translationOf('app.pleaseSelect'),
          value: '',
          selected: null,
        },
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

    it('should return a selected option when called with a selected Organisation', () => {
      const presenter = new RegulatedAuthoritiesSelectPresenter(
        [exampleOrganisation1, exampleOrganisation2],
        exampleOrganisation1,
        null,
        createMockI18nService(),
      );

      expect(presenter.selectArgs()).toEqual([
        {
          text: translationOf('app.pleaseSelect'),
          value: '',
          selected: null,
        },
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

  describe('roleArgs', () => {
    it('should return no selected item when called with no selected role', () => {
      const presenter = new RegulatedAuthoritiesSelectPresenter(
        [exampleOrganisation1, exampleOrganisation2],
        null,
        null,
        createMockI18nService(),
      );

      expect(presenter.roleArgs()).toEqual([
        {
          selected: null,
          text: translationOf('app.pleaseSelect'),
          value: '',
        },
        {
          selected: false,
          text: `${translationOf(
            'organisations.label.roles.primaryRegulator',
          )}`,
          value: 'primaryRegulator',
        },
        {
          selected: false,
          text: `${translationOf('organisations.label.roles.charteredBody')}`,
          value: 'charteredBody',
        },
        {
          selected: false,
          text: `${translationOf('organisations.label.roles.qualifyingBody')}`,
          value: 'qualifyingBody',
        },
        {
          selected: false,
          text: `${translationOf(
            'organisations.label.roles.additionalRegulator',
          )}`,
          value: 'additionalRegulator',
        },
        {
          selected: false,
          text: `${translationOf('organisations.label.roles.oversightBody')}`,
          value: 'oversightBody',
        },
        {
          selected: false,
          text: `${translationOf('organisations.label.roles.enforcementBody')}`,
          value: 'enforcementBody',
        },
        {
          selected: false,
          text: `${translationOf('organisations.label.roles.awardingBody')}`,
          value: 'awardingBody',
        },
      ]);
    });

    it('should return a selected item when called with a selected role', () => {
      const presenter = new RegulatedAuthoritiesSelectPresenter(
        [exampleOrganisation1, exampleOrganisation2],
        null,
        OrganisationRole.AwardingBody,
        createMockI18nService(),
      );

      expect(presenter.roleArgs()).toEqual([
        {
          selected: null,
          text: translationOf('app.pleaseSelect'),
          value: '',
        },
        {
          selected: false,
          text: `${translationOf(
            'organisations.label.roles.primaryRegulator',
          )}`,
          value: 'primaryRegulator',
        },
        {
          selected: false,
          text: `${translationOf('organisations.label.roles.charteredBody')}`,
          value: 'charteredBody',
        },
        {
          selected: false,
          text: `${translationOf('organisations.label.roles.qualifyingBody')}`,
          value: 'qualifyingBody',
        },
        {
          selected: false,
          text: `${translationOf(
            'organisations.label.roles.additionalRegulator',
          )}`,
          value: 'additionalRegulator',
        },
        {
          selected: false,
          text: `${translationOf('organisations.label.roles.oversightBody')}`,
          value: 'oversightBody',
        },
        {
          selected: false,
          text: `${translationOf('organisations.label.roles.enforcementBody')}`,
          value: 'enforcementBody',
        },
        {
          selected: true,
          text: `${translationOf('organisations.label.roles.awardingBody')}`,
          value: 'awardingBody',
        },
      ]);
    });
  });

  describe('authoritiesAndRoles', () => {
    it('should return an object with authorities and roles included', () => {
      const presenter = new RegulatedAuthoritiesSelectPresenter(
        [exampleOrganisation1, exampleOrganisation2],
        null,
        null,
        createMockI18nService(),
      );

      expect(presenter.authoritiesAndRoles()).toEqual({
        authorities: presenter.selectArgs(),
        roles: presenter.roleArgs(),
      });
    });
  });
});
