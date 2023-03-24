import { OrganisationPresenter } from './organisation.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';

import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';

import { escape } from '../../helpers/escape.helper';
import { escapeOf } from '../../testutils/escape-of';
import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { multilineOf } from '../../testutils/multiline-of';
import { translationOf } from '../../testutils/translation-of';
import { formatLink } from '../../helpers/format-link.helper';
import { linkOf } from '../../testutils/link-of';
import { emailOf } from '../../testutils/email-of';
import { formatEmail } from '../../helpers/format-email.helper';
import { formatTelephone } from '../../helpers/format-telephone.helper';
import { telephoneOf } from '../../testutils/telephone-of';

jest.mock('../../helpers/escape.helper');
jest.mock('../../helpers/format-multiline-string.helper');
jest.mock('../../helpers/format-link.helper');
jest.mock('../../helpers/format-email.helper');
jest.mock('../../helpers/format-telephone.helper');

describe('OrganisationPresenter', () => {
  describe('summaryList', () => {
    describe('when all fields are present', () => {
      it('should return all fields', () => {
        const i18nService = createMockI18nService();
        (escape as jest.Mock).mockImplementation(escapeOf);

        const organisation = organisationFactory.withVersion().build();

        const presenter = new OrganisationPresenter(organisation, i18nService);

        expect(presenter.summaryList()).toEqual({
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
                text: 'Translation of `organisations.label.url`',
              },
              value: {
                html: presenter.url(),
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
                text: presenter.telephone(),
              },
            },
          ],
        });
      });
    });

    describe('when a field is missing', () => {
      describe('when removeBlank is true', () => {
        it('should filter out empty fields', () => {
          const i18nService = createMockI18nService();
          (escape as jest.Mock).mockImplementation(escapeOf);
          (formatMultilineString as jest.Mock).mockImplementation(multilineOf);
          (formatEmail as jest.Mock).mockImplementation(emailOf);
          (formatLink as jest.Mock).mockImplementation(linkOf);
          (formatTelephone as jest.Mock).mockImplementation(telephoneOf);

          const organisation = organisationFactory
            .withVersion()
            .build({ alternateName: '' });

          const presenter = new OrganisationPresenter(
            organisation,
            i18nService,
          );
          const list = presenter.summaryList({ removeBlank: true });

          expect(list.rows.length).toEqual(4);
          expect(
            list.rows.filter(
              (item) =>
                'text' in item.key &&
                item.key.text ===
                  'Translation of `organisations.label.alternateName`',
            ).length,
          ).toEqual(0);
        });
      });

      describe('when removeBlank is false', () => {
        it('keeps empty rows intact', () => {
          const i18nService = createMockI18nService();
          (escape as jest.Mock).mockImplementation(escapeOf);

          const organisation = organisationFactory
            .withVersion()
            .build({ alternateName: '' });

          const presenter = new OrganisationPresenter(
            organisation,
            i18nService,
          );
          const list = presenter.summaryList({ removeBlank: false });

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
      it('should include the name of the organisation', () => {
        const i18nService = createMockI18nService();
        (escape as jest.Mock).mockImplementation(escapeOf);

        const organisation = organisationFactory
          .withVersion()
          .build({ name: 'My Organisation' });

        const presenter = new OrganisationPresenter(organisation, i18nService);
        const list = presenter.summaryList({ includeName: true });

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
      it('should include an actions column', () => {
        const i18nService = createMockI18nService();
        (escape as jest.Mock).mockImplementation(escapeOf);

        const version = organisationVersionFactory.build();

        const organisation = organisationFactory
          .withVersion(version)
          .build({ name: 'My Organisation' });

        const presenter = new OrganisationPresenter(organisation, i18nService);
        const list = presenter.summaryList({ includeActions: true });

        for (const row of list.rows) {
          const visuallyHiddenText =
            'text' in row.key ? row.key.text : row.key.html;

          expect(row.actions).toEqual({
            items: [
              {
                href: `/admin/organisations/${organisation.id}/versions/${version.id}/edit`,
                text: 'Translation of `app.change`',
                visuallyHiddenText: visuallyHiddenText,
              },
            ],
          });
        }
      });
    });

    describe('when classes are specified', () => {
      it('should return the specified class', () => {
        const i18nService = createMockI18nService();
        (escape as jest.Mock).mockImplementation(escapeOf);

        const organisation = organisationFactory.build();

        const presenter = new OrganisationPresenter(organisation, i18nService);
        const list = presenter.summaryList({ classes: 'foo' });

        expect(list.classes).toEqual('foo');
      });
    });
  });

  describe('address', () => {
    it('formats the address as a multi-line string', () => {
      const i18nService = createMockI18nService();
      (formatMultilineString as jest.Mock).mockImplementation(multilineOf);

      const organisation = organisationFactory.build({
        address: '123 Fake Street, London, SW1A 1AA',
      });

      const presenter = new OrganisationPresenter(organisation, i18nService);

      expect(presenter.address()).toEqual(
        `${multilineOf('123 Fake Street, London, SW1A 1AA')}`,
      );

      expect(formatMultilineString).toBeCalledWith(
        '123 Fake Street, London, SW1A 1AA',
      );
    });
  });

  describe('email', () => {
    it('makes the email into a link', () => {
      const i18nService = createMockI18nService();
      (formatEmail as jest.Mock).mockImplementation(emailOf);

      const organisation = organisationFactory.build({
        email: 'foo@example.com',
      });

      const presenter = new OrganisationPresenter(organisation, i18nService);

      expect(presenter.email()).toEqual(emailOf('foo@example.com'));

      expect(formatEmail).toBeCalledWith('foo@example.com');
    });
  });

  describe('telephone', () => {
    it('makes the telephone number into a formatted telephone number', () => {
      const i18nService = createMockI18nService();
      (formatTelephone as jest.Mock).mockImplementation(telephoneOf);

      const organisation = organisationFactory.build({
        telephone: '020 7215 5000',
      });

      const presenter = new OrganisationPresenter(organisation, i18nService);

      expect(presenter.telephone()).toEqual(telephoneOf('020 7215 5000'));

      expect(formatTelephone).toBeCalledWith('020 7215 5000');
    });
  });

  describe('url', () => {
    it('makes the url into a link', () => {
      const i18nService = createMockI18nService();
      (formatLink as jest.Mock).mockImplementation(linkOf);

      const organisation = organisationFactory.build({
        url: 'http://www.example.com',
      });

      const presenter = new OrganisationPresenter(organisation, i18nService);

      expect(presenter.url()).toEqual(linkOf('http://www.example.com'));

      expect(formatLink).toBeCalledWith('http://www.example.com');
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
