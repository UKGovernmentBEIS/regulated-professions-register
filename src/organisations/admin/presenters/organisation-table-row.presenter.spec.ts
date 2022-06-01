import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';

import organisationFactory from '../../../testutils/factories/organisation';

import professionFactory from '../../../testutils/factories/profession';
import industryFactory from '../../../testutils/factories/industry';
import { escape } from '../../../helpers/escape.helper';
import { escapeOf } from '../../../testutils/escape-of';
import userFactory from '../../../testutils/factories/user';
import { formatDate } from '../../../common/utils';
import { translationOf } from '../../../testutils/translation-of';
import { ProfessionVersionStatus } from '../../../professions/profession-version.entity';
import professionVersionFactory from '../../../testutils/factories/profession-version';
import { OrganisationVersionStatus } from '../../organisation-version.entity';
import { ProfessionToOrganisation } from 'src/professions/profession-to-organisation.entity';
import { statusOf } from '../../../testutils/status-of';
import { formatStatus } from '../../../helpers/format-status.helper';
import * as nationsHelperModule from '../../../helpers/nations.helper';
import { Profession } from '../../../professions/profession.entity';
import { OrganisationTableRowPresenter } from './organisation-table-row.presenter';

jest.mock('../../../helpers/escape.helper');
jest.mock('../../../common/utils');
jest.mock('../../../helpers/format-status.helper');

describe('OrganisationTableRowPresenter', () => {
  describe('tableRow', () => {
    describe('when all relations are present', () => {
      describe('when the professions share one industry', () => {
        it('returns the table row data', () => {
          const industries = [industryFactory.build({ name: 'Industry 1' })];

          const professionToOrganisations = professionFactory
            .buildList(4, {
              versions: [
                professionVersionFactory.build({
                  occupationLocations: ['GB-ENG', 'GB-WLS'],
                  industries: [industries[0]],
                  status: ProfessionVersionStatus.Draft,
                }),
              ],
            })
            .map((profession) => {
              return { profession: profession };
            }) as ProfessionToOrganisation[];

          const organisation = organisationFactory.build({
            lastModified: new Date('01-01-2022'),
            changedByUser: userFactory.build({ name: 'beis-rpr' }),
            status: OrganisationVersionStatus.Draft,
            professionToOrganisations: professionToOrganisations,
          });

          (escape as jest.Mock).mockImplementation(escapeOf);
          (formatStatus as jest.Mock).mockImplementation(statusOf);

          const getNationsFromProfessionsSpy = jest
            .spyOn(nationsHelperModule, 'getNationsFromProfessions')
            .mockReturnValue(
              `${translationOf('nations.england')}, ${translationOf(
                'nations.wales',
              )}`,
            );

          const i18nService = createMockI18nService();

          const presenter = new OrganisationTableRowPresenter(
            organisation,
            i18nService,
          );
          const tableRow = presenter.tableRow();

          expect(tableRow[0]).toEqual({ text: organisation.name });
          expect(tableRow[1]).toEqual({
            text: `${translationOf('nations.england')}, ${translationOf(
              'nations.wales',
            )}`,
          });
          expect(tableRow[2]).toEqual({
            text: translationOf(industries[0].name),
          });
          expect(tableRow[3]).toEqual({
            text: presenter.lastModified,
          });
          expect(tableRow[4]).toEqual({
            text: presenter.changedBy.name,
            attributes: {
              'data-cy': 'changed-by-user',
            },
          });
          expect(tableRow[5]).toEqual({
            html: statusOf(OrganisationVersionStatus.Draft),
          });
          expect(tableRow[6]).toEqual({
            html: expect.stringContaining(
              `<a class="govuk-link" href="/admin/organisations/${
                organisation.id
              }/versions/${organisation.versionId}">${translationOf(
                'organisations.admin.viewDetails',
              )}`,
            ),
          });

          expect(escape).toBeCalledWith(organisation.name);

          const expectedProfessions = professionToOrganisations.map(
            (professionToOrganisation) =>
              Profession.withLatestLiveOrDraftVersion(
                professionToOrganisation.profession,
              ),
          );

          expect(getNationsFromProfessionsSpy).toBeCalledWith(
            expectedProfessions,
            i18nService,
          );
        });
      });

      describe('when the professions share multiple industries', () => {
        it('returns the table row data', () => {
          const industries = [
            industryFactory.build({ name: 'industry.1' }),
            industryFactory.build({ name: 'industry.2' }),
            industryFactory.build({ name: 'industry.3' }),
          ];

          const professionToOrganisations = [
            professionFactory.buildList(4, {
              versions: [
                professionVersionFactory.build({
                  occupationLocations: ['GB-WLS'],
                  industries: [industries[0]],
                  status: ProfessionVersionStatus.Draft,
                }),
              ],
            }),
            professionFactory.buildList(2, {
              versions: [
                professionVersionFactory.build({
                  occupationLocations: ['GB-SCT'],
                  industries: [industries[1], industries[2]],
                  status: ProfessionVersionStatus.Draft,
                }),
              ],
            }),
          ]
            .flat()
            .map((profession) => {
              return { profession: profession };
            }) as ProfessionToOrganisation[];

          const organisation = organisationFactory.build({
            lastModified: new Date('01-01-2022'),
            changedByUser: userFactory.build({ name: 'beis-rpr' }),
            status: OrganisationVersionStatus.Draft,
            professionToOrganisations: professionToOrganisations,
          });
          (escape as jest.Mock).mockImplementation(escapeOf);
          (formatStatus as jest.Mock).mockImplementation(statusOf);

          const getNationsFromProfessionsSpy = jest
            .spyOn(nationsHelperModule, 'getNationsFromProfessions')
            .mockReturnValue(
              `${translationOf('nations.wales')}, ${translationOf(
                'nations.scotland',
              )}`,
            );

          const i18nService = createMockI18nService();

          const presenter = new OrganisationTableRowPresenter(
            organisation,
            i18nService,
          );
          const tableRow = presenter.tableRow();

          expect(tableRow[0]).toEqual({ text: organisation.name });
          expect(tableRow[1]).toEqual({
            text: `${translationOf('nations.wales')}, ${translationOf(
              'nations.scotland',
            )}`,
          });
          expect(tableRow[2]).toEqual({
            text: [
              translationOf(industries[0].name),
              translationOf(industries[1].name),
              translationOf(industries[2].name),
            ].join(', '),
          });
          expect(tableRow[3]).toEqual({
            text: presenter.lastModified,
          });
          expect(tableRow[4]).toEqual({
            text: presenter.changedBy.name,
            attributes: {
              'data-cy': 'changed-by-user',
            },
          });
          expect(tableRow[5]).toEqual({
            html: statusOf(OrganisationVersionStatus.Draft),
          });

          const expectedProfessions = professionToOrganisations.map(
            (professionToOrganisation) =>
              Profession.withLatestLiveOrDraftVersion(
                professionToOrganisation.profession,
              ),
          );

          expect(getNationsFromProfessionsSpy).toBeCalledWith(
            expectedProfessions,
            i18nService,
          );
        });
      });

      describe('when there are no professionToOrganisations on the regulator', () => {
        it('returns empty text for industries', () => {
          const professionToOrganisations = [];

          const organisation = organisationFactory.build({
            lastModified: new Date('01-01-2022'),
            changedByUser: userFactory.build({ name: 'beis-rpr' }),
            status: OrganisationVersionStatus.Draft,
            professionToOrganisations: professionToOrganisations,
          });
          (escape as jest.Mock).mockImplementation(escapeOf);
          (formatStatus as jest.Mock).mockImplementation(statusOf);

          jest.spyOn(nationsHelperModule, 'getNationsFromProfessions');

          const i18nService = createMockI18nService();

          const presenter = new OrganisationTableRowPresenter(
            organisation,
            i18nService,
          );
          const tableRow = presenter.tableRow();

          expect(tableRow[2]).toEqual({ text: '' });
        });
      });
    });
  });

  describe('changedBy', () => {
    describe('when the Profession has been edited by a user', () => {
      it('returns the details of the user', () => {
        const organisation = organisationFactory.build({
          changedByUser: userFactory.build({
            name: 'beis-rpr',
            email: 'beis-rpr@example.com',
          }),
        });

        const presenter = new OrganisationTableRowPresenter(
          organisation,
          createMockI18nService(),
        );

        expect(presenter.changedBy).toEqual({
          name: 'beis-rpr',
          email: 'beis-rpr@example.com',
        });
      });
    });

    describe("when the Profession hasn't yet been edited by a user", () => {
      it('returns `null`', () => {
        const organisation = organisationFactory.build({
          changedByUser: undefined,
        });

        const presenter = new OrganisationTableRowPresenter(
          organisation,
          createMockI18nService(),
        );

        expect(presenter.changedBy).toEqual(null);
      });
    });
  });

  describe('lastModified', () => {
    it('should format the lastModified date on a profession', () => {
      const organisation = organisationFactory.build({
        lastModified: new Date('01-01-2022'),
      });

      const presenter = new OrganisationTableRowPresenter(
        organisation,
        createMockI18nService(),
      );

      presenter.lastModified;
      expect(formatDate as jest.Mock).toHaveBeenCalledWith(
        new Date('01-01-2022'),
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
