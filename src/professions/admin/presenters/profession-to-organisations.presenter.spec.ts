import { escape } from '../../../helpers/escape.helper';
import { escapeOf } from '../../../testutils/escape-of';
import organisationFactory from '../../../testutils/factories/organisation';
import professionFactory from '../../../testutils/factories/profession';
import professionVersionFactory from '../../../testutils/factories/profession-version';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { ProfessionToOrganisationsPresenter } from './profession-to-organisations.presenter';
import {
  ProfessionToOrganisation,
  OrganisationRole,
} from '../../profession-to-organisation.entity';
import userFactory from '../../../testutils/factories/user';
import { getPermissionsFromUser } from '../../../users/helpers/get-permissions-from-user.helper';
import { UserPermission } from '../../../users/user-permission';

import { translationOf } from '../../../testutils/translation-of';

jest.mock('../../../helpers/escape.helper');
jest.mock('../../../users/helpers/get-permissions-from-user.helper');

(escape as jest.Mock).mockImplementation(escapeOf);

describe('ProfessionToOrganisationsPresenter', () => {
  describe('summaryLists', () => {
    it('should return an array of summary list objects', () => {
      const organisation1 = organisationFactory.build({
        name: 'Organisation 1',
      });
      const organisation2 = organisationFactory.build({
        name: 'Organisation 2',
      });

      const professionToOrganisations = [
        {
          organisation: organisation1,
          role: OrganisationRole.AdditionalRegulator,
        },
        {
          organisation: organisation2,
          role: OrganisationRole.AwardingBody,
        },
      ] as ProfessionToOrganisation[];
      const profession = professionFactory.build({
        professionToOrganisations: professionToOrganisations,
      });
      const professionVersion = professionVersionFactory.build();
      const i18nService = createMockI18nService();
      const user = userFactory.build();

      const permissions = [UserPermission.CreateProfession];

      (getPermissionsFromUser as jest.Mock).mockReturnValue(permissions);

      const professionToOrganisationsPresenter =
        new ProfessionToOrganisationsPresenter(
          profession,
          professionVersion,
          i18nService,
          user,
        );

      expect(professionToOrganisationsPresenter.summaryLists()).toEqual([
        {
          attributes: {
            'data-cy': `profession-to-organisation-1`,
          },
          rows: [
            {
              key: {
                text: translationOf(
                  'professions.form.label.organisations.name',
                ),
              },
              value: { text: escapeOf(organisation1.name) },
              actions: {
                items: [
                  {
                    href: `/admin/professions/${profession.id}/versions/${professionVersion.id}/organisations/edit?change=true`,
                    text: translationOf('app.change'),
                    visuallyHiddenText: escapeOf(organisation1.name),
                  },
                ],
              },
            },
            {
              key: {
                text: translationOf(
                  'professions.form.label.organisations.role',
                ),
              },
              value: {
                text: translationOf(
                  'organisations.label.roles.additionalRegulator',
                ),
              },
              actions: {
                items: [
                  {
                    href: `/admin/professions/${profession.id}/versions/${professionVersion.id}/organisations/edit?change=true`,
                    text: translationOf('app.change'),
                    visuallyHiddenText: escapeOf(organisation1.name),
                  },
                ],
              },
            },
          ],
        },
        {
          attributes: {
            'data-cy': `profession-to-organisation-2`,
          },
          rows: [
            {
              key: {
                text: translationOf(
                  'professions.form.label.organisations.name',
                ),
              },
              value: { text: escapeOf(organisation2.name) },
              actions: {
                items: [
                  {
                    href: `/admin/professions/${profession.id}/versions/${professionVersion.id}/organisations/edit?change=true`,
                    text: translationOf('app.change'),
                    visuallyHiddenText: escapeOf(organisation2.name),
                  },
                ],
              },
            },
            {
              key: {
                text: translationOf(
                  'professions.form.label.organisations.role',
                ),
              },
              value: {
                text: translationOf('organisations.label.roles.awardingBody'),
              },
              actions: {
                items: [
                  {
                    href: `/admin/professions/${profession.id}/versions/${professionVersion.id}/organisations/edit?change=true`,
                    text: translationOf('app.change'),
                    visuallyHiddenText: escapeOf(organisation2.name),
                  },
                ],
              },
            },
          ],
        },
      ]);
    });

    it("should not include the edit links if a user cannot edit a profession's organisation", () => {
      const organisation1 = organisationFactory.build({
        name: 'Organisation 1',
      });
      const organisation2 = organisationFactory.build({
        name: 'Organisation 2',
      });

      const professionToOrganisations = [
        {
          organisation: organisation1,
          role: OrganisationRole.AdditionalRegulator,
        },
        {
          organisation: organisation2,
          role: OrganisationRole.AwardingBody,
        },
      ] as ProfessionToOrganisation[];
      const profession = professionFactory.build({
        professionToOrganisations: professionToOrganisations,
      });
      const professionVersion = professionVersionFactory.build();
      const i18nService = createMockI18nService();
      const user = userFactory.build();

      const permissions = [UserPermission.CreateUser];

      (getPermissionsFromUser as jest.Mock).mockReturnValue(permissions);

      const professionToOrganisationsPresenter =
        new ProfessionToOrganisationsPresenter(
          profession,
          professionVersion,
          i18nService,
          user,
        );

      expect(professionToOrganisationsPresenter.summaryLists()).toEqual([
        {
          attributes: {
            'data-cy': `profession-to-organisation-1`,
          },
          rows: [
            {
              key: {
                text: translationOf(
                  'professions.form.label.organisations.name',
                ),
              },
              value: { text: escapeOf(organisation1.name) },
            },
            {
              key: {
                text: translationOf(
                  'professions.form.label.organisations.role',
                ),
              },
              value: {
                text: translationOf(
                  'organisations.label.roles.additionalRegulator',
                ),
              },
            },
          ],
        },
        {
          attributes: {
            'data-cy': `profession-to-organisation-2`,
          },
          rows: [
            {
              key: {
                text: translationOf(
                  'professions.form.label.organisations.name',
                ),
              },
              value: { text: escapeOf(organisation2.name) },
            },
            {
              key: {
                text: translationOf(
                  'professions.form.label.organisations.role',
                ),
              },
              value: {
                text: translationOf('organisations.label.roles.awardingBody'),
              },
            },
          ],
        },
      ]);
    });

    describe('when there are no profession to organisation relations', () => {
      it('should return an array with one empty summary list object', () => {
        const profession = professionFactory.build({
          professionToOrganisations: [],
        });
        const professionVersion = professionVersionFactory.build();
        const i18nService = createMockI18nService();
        const user = userFactory.build();

        const professionToOrganisationsPresenter =
          new ProfessionToOrganisationsPresenter(
            profession,
            professionVersion,
            i18nService,
            user,
          );

        expect(professionToOrganisationsPresenter.summaryLists()).toEqual([
          {
            rows: [
              {
                key: {
                  text: translationOf(
                    'professions.form.label.organisations.name',
                  ),
                },
                value: { text: '' },
              },
              {
                key: {
                  text: translationOf(
                    'professions.form.label.organisations.role',
                  ),
                },
                value: {
                  text: '',
                },
              },
            ],
          },
        ]);
      });
    });
  });
});
