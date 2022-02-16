import { Profession } from './../profession.entity';
import { ProfessionPresenter } from './profession.presenter';
import { Nation } from '../../nations/nation';

import { stringifyNations } from '../../nations/helpers/stringifyNations';

import professionFactory from '../../testutils/factories/profession';
import industryFactory from '../../testutils/factories/industry';
import { formatMultilineString } from '../../helpers/format-multiline-string.helper';
import { multilineOf } from '../../testutils/multiline-of';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';

jest.mock('../../nations/helpers/stringifyNations');
jest.mock('../../helpers/format-multiline-string.helper');

describe('ProfessionPresenter', () => {
  let profession: Profession;

  describe('summaryList', () => {
    it('should return a summary list', async () => {
      const i18nService = createMockI18nService();
      (formatMultilineString as jest.Mock).mockImplementation(multilineOf);

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
              text: await presenter.occupationLocations(),
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
          {
            key: {
              text: translationOf('professions.show.qualification.level'),
            },
            value: {
              html: multilineOf(profession.qualification.level),
            },
          },
        ],
      });

      expect(formatMultilineString).toBeCalledWith(
        profession.qualification.level,
      );
    });
  });

  describe('occupationLocations', () => {
    it('should pass the locations to stringifyNations', async () => {
      const i18nService = createMockI18nService();

      profession = professionFactory.build({
        occupationLocations: ['GB-ENG', 'GB-SCT', 'GB-WLS', 'GB-NIR'],
      });

      const presenter = new ProfessionPresenter(profession, i18nService);
      const nations = profession.occupationLocations.map((code) =>
        Nation.find(code),
      );

      await presenter.occupationLocations();

      expect(stringifyNations).toHaveBeenCalledWith(nations, i18nService);
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
