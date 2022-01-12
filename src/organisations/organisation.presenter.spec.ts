import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { I18nService } from 'nestjs-i18n';
import { OrganisationPresenter } from './organisation.presenter';
import { Organisation } from './organisation.entity';
import { Industry } from '../industries/industry.entity';
import { Profession } from '../professions/profession.entity';

import organisationFactory from '../testutils/factories/organisation';
import professionFactory from '../testutils/factories/profession';
import industryFactory from '../testutils/factories/industry';

describe('OrganisationPresenter', () => {
  let organisation: Organisation;
  let industries: Industry[];
  let professions: Profession[];

  const i18nService: DeepMocked<I18nService> = createMock<I18nService>({
    translate: async (key: string) => {
      return key;
    },
  });

  describe('tableRow', () => {
    describe('when all relations are present', () => {
      describe('when the professions share one industry', () => {
        beforeEach(() => {
          industries = [industryFactory.build({ name: 'Industry 1' })];

          professions = [
            professionFactory.buildList(4, { industries: [industries[0]] }),
          ].flat();

          organisation = organisationFactory.build({
            professions: professions,
          });
        });

        it('returns the table row data', async () => {
          const presenter = new OrganisationPresenter(
            organisation,
            i18nService,
          );
          const tableRow = await presenter.tableRow();

          expect(tableRow[0]).toEqual({ text: organisation.name });
          expect(tableRow[1]).toEqual({ text: organisation.alternateName });
          expect(tableRow[2]).toEqual({
            html: industries[0].name,
          });
        });
      });

      describe('when the professions share multiple industries', () => {
        beforeEach(() => {
          industries = [
            industryFactory.build({ name: 'Industry 1' }),
            industryFactory.build({ name: 'Industry 2' }),
            industryFactory.build({ name: 'Industry 3' }),
          ];

          professions = [
            professionFactory.buildList(4, { industries: [industries[0]] }),
            professionFactory.buildList(2, {
              industries: [industries[1], industries[2]],
            }),
          ].flat();

          organisation = organisationFactory.build({
            professions: professions,
          });
        });

        it('returns the table row data', async () => {
          const presenter = new OrganisationPresenter(
            organisation,
            i18nService,
          );
          const tableRow = await presenter.tableRow();

          expect(tableRow[0]).toEqual({ text: organisation.name });
          expect(tableRow[1]).toEqual({ text: organisation.alternateName });
          expect(tableRow[2]).toEqual({
            html: [
              industries[0].name,
              industries[1].name,
              industries[2].name,
            ].join('<br />'),
          });
        });
      });
    });

    describe('when the profession relation is not loaded', () => {
      beforeEach(() => {
        organisation = organisationFactory.build({
          professions: undefined,
        });
      });

      it('should raise an error', async () => {
        const presenter = new OrganisationPresenter(organisation, i18nService);

        expect(async () => {
          await presenter.tableRow();
        }).rejects.toThrowError(
          "You must eagerly load professions to show industries. Try adding `{ relations: ['professions'] }` to your finder in the `OrganisationsService` class",
        );
      });
    });

    describe('when the industries relation is not loaded', () => {
      beforeEach(() => {
        organisation = organisationFactory.build({
          professions: [professionFactory.build({ industries: undefined })],
        });
      });

      it('should raise an error', async () => {
        const presenter = new OrganisationPresenter(organisation, i18nService);

        expect(async () => {
          await presenter.tableRow();
        }).rejects.toThrowError(
          "You must eagerly load industries to show industries. Try adding `{ relations: ['professions.industries'] }` to your finder in the `OrganisationsService` class",
        );
      });
    });
  });
});
