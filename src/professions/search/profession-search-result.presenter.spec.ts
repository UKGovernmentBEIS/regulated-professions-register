import { DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import industryFactory from '../../testutils/factories/industry';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { translationOf } from '../../testutils/translation-of';
import { ProfessionSearchResultPresenter } from './profession-search-result.presenter';
import * as getOrganisationsFromProfessionModule from '../helpers/get-organisations-from-profession.helper';

describe('ProfessionSearchResultPresenter', () => {
  let i18nService: DeepMocked<I18nService>;

  beforeEach(() => {
    i18nService = createMockI18nService();
  });

  describe('present', () => {
    it('Returns a ProfessionSearchResultTemplate', () => {
      const organisations = [
        organisationFactory.build({
          name: 'Example Organisation',
        }),
        organisationFactory.build({
          name: 'Additional Example Organisation',
        }),
      ];

      const exampleProfession = professionFactory.build(
        {
          name: 'Example Profession',
          slug: 'example-profession',
          occupationLocations: ['GB-ENG', 'GB-WLS'],
          industries: [
            industryFactory.build({ id: 'industries.health', name: 'health' }),
            industryFactory.build({ id: 'industries.law', name: 'law' }),
          ],
        },
        { transient: { organisations: organisations } },
      );

      const getOrganisationsFromProfessionSpy = jest.spyOn(
        getOrganisationsFromProfessionModule,
        'getOrganisationsFromProfession',
      );

      const result = new ProfessionSearchResultPresenter(
        exampleProfession,
        i18nService,
      ).present();

      expect(result).toEqual({
        name: 'Example Profession',
        slug: 'example-profession',
        organisations: [
          'Example Organisation',
          'Additional Example Organisation',
        ],
        nations: `${translationOf('nations.england')}, ${translationOf(
          'nations.wales',
        )}`,
        industries: [translationOf('health'), translationOf('law')],
      });

      expect(getOrganisationsFromProfessionSpy).toBeCalledWith(
        exampleProfession,
      );
    });

    describe('when the Profession is missing some fields', () => {
      it('returns empty values', () => {
        const exampleProfession = professionFactory.build({
          occupationLocations: undefined,
          industries: undefined,
        });

        const getOrganisationsFromProfessionSpy = jest.spyOn(
          getOrganisationsFromProfessionModule,
          'getOrganisationsFromProfession',
        );

        const result = new ProfessionSearchResultPresenter(
          exampleProfession,
          i18nService,
        ).present();

        expect(result).toEqual(
          expect.objectContaining({
            nations: '',
            industries: [],
          }),
        );

        expect(getOrganisationsFromProfessionSpy).toBeCalledWith(
          exampleProfession,
        );
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
