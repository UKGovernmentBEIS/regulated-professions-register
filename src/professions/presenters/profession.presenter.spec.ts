import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';

import { Profession } from './../profession.entity';
import { ProfessionPresenter } from './profession.presenter';
import { Nation } from '../../nations/nation';

import { stringifyNations } from '../../nations/helpers/stringifyNations';

import professionFactory from '../../testutils/factories/profession';
import industryFactory from '../../testutils/factories/industry';

jest.mock('../../nations/helpers/stringifyNations');

describe('ProfessionPresenter', () => {
  let profession: Profession;
  const i18nService: DeepMocked<I18nService> = createMock<I18nService>({
    translate: async (key: string) => {
      return key;
    },
  });

  describe('summaryList', () => {
    it('should return a summary list', async () => {
      profession = professionFactory.build();

      const presenter = new ProfessionPresenter(profession, i18nService);

      expect(await presenter.summaryList()).toEqual({
        classes: 'govuk-summary-list--no-border',
        rows: [
          {
            key: {
              text: 'professions.show.overview.nations',
            },
            value: {
              text: await presenter.occupationLocations(),
            },
          },
          {
            key: {
              text: 'professions.show.overview.industry',
            },
            value: {
              text: await presenter.industries(),
            },
          },
          {
            key: {
              text: 'professions.show.qualification.level',
            },
            value: {
              text: profession.qualification.level,
            },
          },
        ],
      });
    });
  });

  describe('occupationLocations', () => {
    it('should pass the locations to stringifyNations', async () => {
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
      profession = professionFactory.build({
        industries: [
          industryFactory.build({ name: 'foo' }),
          industryFactory.build({ name: 'bar' }),
        ],
      });

      const presenter = new ProfessionPresenter(profession, i18nService);

      expect(await presenter.industries()).toEqual('foo, bar');
    });
  });
});
