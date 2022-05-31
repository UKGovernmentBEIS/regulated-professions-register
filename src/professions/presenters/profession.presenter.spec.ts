import { Profession } from './../profession.entity';
import { ProfessionPresenter } from './profession.presenter';
import { Nation } from '../../nations/nation';

import professionFactory from '../../testutils/factories/profession';
import industryFactory from '../../testutils/factories/industry';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import userFactory from '../../testutils/factories/user';
import { formatDate } from '../../common/utils';
import { ProfessionVersionStatus } from '../profession-version.entity';
import { statusOf } from '../../testutils/status-of';
import { formatStatus } from '../../helpers/format-status.helper';
import { NationsListPresenter } from '../../nations/presenters/nations-list.presenter';

jest.mock('../../helpers/format-multiline-string.helper');
jest.mock('../../common/utils');
jest.mock('../../helpers/format-status.helper');
jest.mock('../../nations/presenters/nations-list.presenter');

describe('ProfessionPresenter', () => {
  let profession: Profession;

  describe('summaryList', () => {
    it('should return a summary list', async () => {
      const i18nService = createMockI18nService();

      profession = professionFactory.build();

      const presenter = new ProfessionPresenter(profession, i18nService);

      expect(await presenter.summaryList()).toEqual({
        classes: 'govuk-summary-list--no-border',
        rows: [
          {
            key: {
              text: translationOf('professions.show.overview.nations'),
            },
            value: {
              text: presenter.occupationLocations(),
            },
          },
          {
            key: {
              text: translationOf('professions.show.overview.industry'),
            },
            value: {
              text: await presenter.industries(),
            },
          },
        ],
      });
    });
  });

  describe('changedBy', () => {
    describe('when the Profession has been edited by a user', () => {
      it('returns the details of the user', () => {
        const profession = professionFactory.build({
          changedByUser: userFactory.build({
            name: 'beis-rpr',
            email: 'beis-rpr@example.com',
          }),
        });

        const presenter = new ProfessionPresenter(
          profession,
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
        const profession = professionFactory.build({
          changedByUser: undefined,
        });

        const presenter = new ProfessionPresenter(
          profession,
          createMockI18nService(),
        );

        expect(presenter.changedBy).toEqual(null);
      });
    });
  });

  describe('lastModified', () => {
    it('should format the lastModified date on a Profession', () => {
      const profession = professionFactory.build({
        lastModified: new Date('01-01-2022'),
      });

      const presenter = new ProfessionPresenter(
        profession,
        createMockI18nService(),
      );

      presenter.lastModified;
      expect(formatDate as jest.Mock).toHaveBeenCalledWith(
        new Date('01-01-2022'),
      );
    });
  });

  describe('status', () => {
    it('should format the status on a Profession', async () => {
      const profession = professionFactory.build({
        status: ProfessionVersionStatus.Draft,
      });

      const i18nService = createMockI18nService();

      const presenter = new ProfessionPresenter(profession, i18nService);

      (formatStatus as jest.Mock).mockImplementation((status) =>
        statusOf(status),
      );

      const result = presenter.status;

      expect(result).toEqual(statusOf(ProfessionVersionStatus.Draft));
      expect(formatStatus).toBeCalledWith(
        ProfessionVersionStatus.Draft,
        i18nService,
      );
    });
  });

  describe('occupationLocations', () => {
    describe('when occupationLocations is defined', () => {
      it('should pass the locations to NationsListPresenter', () => {
        const i18nService = createMockI18nService();

        profession = professionFactory.build({
          occupationLocations: ['GB-ENG', 'GB-SCT', 'GB-WLS', 'GB-NIR'],
        });

        const presenter = new ProfessionPresenter(profession, i18nService);
        const nations = profession.occupationLocations.map((code) =>
          Nation.find(code),
        );

        presenter.occupationLocations();

        expect(NationsListPresenter).toHaveBeenCalledWith(nations, i18nService);
      });
    });

    describe('when occupationLocations is undefined', () => {
      it('should pass an empty array to NationsListPresenter', () => {
        const i18nService = createMockI18nService();

        profession = professionFactory.build({
          occupationLocations: undefined,
        });

        const presenter = new ProfessionPresenter(profession, i18nService);

        presenter.occupationLocations();

        expect(NationsListPresenter).toHaveBeenCalledWith([], i18nService);
      });
    });
  });

  describe('industries', () => {
    it('should return a comma-separated list of industry names', async () => {
      const i18nService = createMockI18nService();

      profession = professionFactory.build({
        industries: [
          industryFactory.build({ name: 'foo' }),
          industryFactory.build({ name: 'bar' }),
        ],
      });

      const presenter = new ProfessionPresenter(profession, i18nService);

      expect(await presenter.industries()).toEqual(
        `${translationOf('foo')}, ${translationOf('bar')}`,
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
