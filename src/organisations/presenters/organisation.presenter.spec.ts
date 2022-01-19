import { DeepMocked } from '@golevelup/ts-jest';

import { I18nService } from 'nestjs-i18n';
import { OrganisationPresenter } from './organisation.presenter';
import { Organisation } from '../organisation.entity';
import { Industry } from '../../industries/industry.entity';
import { Profession } from '../../professions/profession.entity';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';

import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import industryFactory from '../../testutils/factories/industry';

describe('OrganisationPresenter', () => {
  let organisation: Organisation;
  let industries: Industry[];
  let professions: Profession[];

  const i18nService: DeepMocked<I18nService> = createMockI18nService();

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
            html: `Translation of \`${industries[0].name}\``,
          });
          expect(tableRow[3]).toEqual({
            html: expect.stringContaining(
              `<a class="govuk-link" href="/admin/organisations/${organisation.slug}">`,
            ),
          });
          expect(tableRow[3]).toEqual({
            html: expect.stringContaining(`about ${organisation.name}`),
          });
        });
      });

      describe('when the professions share multiple industries', () => {
        beforeEach(() => {
          industries = [
            industryFactory.build({ name: 'industry.1' }),
            industryFactory.build({ name: 'industry.2' }),
            industryFactory.build({ name: 'industry.3' }),
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
              `Translation of \`${industries[0].name}\``,
              `Translation of \`${industries[1].name}\``,
              `Translation of \`${industries[2].name}\``,
            ].join('<br />'),
          });
        });
      });
    });

    describe('when the professions relation is not loaded', () => {
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
          'You must eagerly load professions to show industries. Try calling a "WithProfessions" method on the `OrganisationsService` class',
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
          'You must eagerly load industries to show industries. Try calling a "WithProfessions" method on the `OrganisationsService` class',
        );
      });
    });
  });

  describe('summaryList', () => {
    describe('when all fields are present', () => {
      it('should return all fields', async () => {
        const presenter = new OrganisationPresenter(organisation, i18nService);

        expect(await presenter.summaryList()).toEqual({
          classes: 'govuk-summary-list--no-border',
          rows: [
            {
              key: {
                text: 'Translation of `organisations.label.alternateName`',
              },
              value: {
                text: organisation.alternateName,
              },
            },
            {
              key: {
                text: 'Translation of `organisations.label.contactUrl`',
              },
              value: {
                html: presenter.contactUrl(),
              },
            },
            {
              key: {
                text: 'Translation of `organisations.label.address`',
              },
              value: {
                html: presenter.address(),
              },
            },
            {
              key: {
                text: 'Translation of `organisations.label.email`',
              },
              value: {
                html: presenter.email(),
              },
            },
            {
              key: {
                text: 'Translation of `organisations.label.telephone`',
              },
              value: {
                text: organisation.telephone,
              },
            },
          ],
        });
      });
    });

    describe('when a field is missing', () => {
      describe('when removeBlank is true', () => {
        it('should filter out empty fields', async () => {
          organisation = organisationFactory.build({ alternateName: '' });
          const presenter = new OrganisationPresenter(
            organisation,
            i18nService,
          );
          const list = await presenter.summaryList({ removeBlank: true });

          expect(list.rows.length).toEqual(4);
          expect(
            list.rows.filter(
              (item) =>
                item.key ===
                { text: 'Translation of `organisations.label.alternateName`' },
            ).length,
          ).toEqual(0);
        });
      });

      describe('when removeBlank is false', () => {
        it('keeps empty rows intact', async () => {
          organisation = organisationFactory.build({ alternateName: '' });
          const presenter = new OrganisationPresenter(
            organisation,
            i18nService,
          );
          const list = await presenter.summaryList({ removeBlank: false });

          expect(list.rows.length).toEqual(5);

          expect(
            list.rows.filter(
              (item) =>
                'text' in item.key &&
                item.key.text ===
                  'Translation of `organisations.label.alternateName`',
            ).length,
          ).toEqual(1);
        });
      });
    });

    describe('when includeName is true', () => {
      it('should include the name of the organisation', async () => {
        organisation = organisationFactory.build({ name: 'My Organisation' });
        const presenter = new OrganisationPresenter(organisation, i18nService);
        const list = await presenter.summaryList({ includeName: true });

        expect(list.rows.length).toEqual(6);

        expect(list.rows[0]).toEqual({
          key: {
            text: 'Translation of `organisations.label.name`',
          },
          value: {
            text: 'My Organisation',
          },
        });
      });
    });

    describe('when includeActions is true', () => {
      it('should include an actions column', async () => {
        organisation = organisationFactory.build({ name: 'My Organisation' });
        const presenter = new OrganisationPresenter(organisation, i18nService);
        const list = await presenter.summaryList({ includeActions: true });

        for (const row of list.rows) {
          const visuallyHiddenText =
            'text' in row.key ? row.key.text : row.key.html;

          expect(row.actions).toEqual({
            items: [
              {
                href: `/admin/organisations/${organisation.slug}/edit`,
                text: 'Translation of `app.change`',
                visuallyHiddenText: visuallyHiddenText,
              },
            ],
          });
        }
      });
    });

    describe('when classes are specified', () => {
      it('should return the specified class', async () => {
        const presenter = new OrganisationPresenter(organisation, i18nService);
        const list = await presenter.summaryList({ classes: 'foo' });

        expect(list.classes).toEqual('foo');
      });
    });
  });

  describe('address', () => {
    it('breaks the address into lines', () => {
      organisation = organisationFactory.build({
        address: '123 Fake Street, London, SW1A 1AA',
      });

      const presenter = new OrganisationPresenter(organisation, i18nService);

      expect(presenter.address()).toEqual(
        '123 Fake Street<br /> London<br /> SW1A 1AA',
      );
    });
  });

  describe('email', () => {
    it('makes the email into a link', () => {
      organisation = organisationFactory.build({
        email: 'foo@example.com',
      });

      const presenter = new OrganisationPresenter(organisation, i18nService);

      expect(presenter.email()).toEqual(
        '<a href="mailto:foo@example.com" class="govuk-link">foo@example.com</a>',
      );
    });
  });

  describe('contactUrl', () => {
    it('makes the url into a link', () => {
      organisation = organisationFactory.build({
        contactUrl: 'http://www.example.com',
      });

      const presenter = new OrganisationPresenter(organisation, i18nService);

      expect(presenter.contactUrl()).toEqual(
        '<a href="http://www.example.com" class="govuk-link">http://www.example.com</a>',
      );
    });
  });
});
