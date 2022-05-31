import * as nationsHelperModule from '../../helpers/nations.helper';
import { ProfessionToOrganisation } from '../../professions/profession-to-organisation.entity';
import { ProfessionVersionStatus } from '../../professions/profession-version.entity';
import { Profession } from '../../professions/profession.entity';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import { translationOf } from '../../testutils/translation-of';
import { OrganisationSearchResultPresenter } from './organisation-search-result.presenter';

describe('OrganisationSearchResultPresenter', () => {
  describe('present', () => {
    it('Returns a OrganisationSearchResultTemplate', () => {
      const i18nService = createMockI18nService();

      const professionToOrganisations = [
        {
          profession: professionFactory.build({
            versions: [
              professionVersionFactory.build({
                occupationLocations: ['GB-ENG', 'GB-WLS'],
                status: ProfessionVersionStatus.Live,
              }),
            ],
          }),
        },
      ] as ProfessionToOrganisation[];

      const organisation = organisationFactory.build({
        name: 'Example Organisation',
        slug: 'example-organisation',
        professionToOrganisations,
      });

      const getNationsFromProfessionsSpy = jest
        .spyOn(nationsHelperModule, 'getNationsFromProfessions')
        .mockReturnValue(
          `${translationOf('nations.england')}, ${translationOf(
            'nations.wales',
          )}`,
        );

      const result = new OrganisationSearchResultPresenter(
        organisation,
        i18nService,
      ).present();

      expect(result).toEqual({
        name: 'Example Organisation',
        slug: 'example-organisation',
        nations: `${translationOf('nations.england')}, ${translationOf(
          'nations.wales',
        )}`,
      });

      const expectedProfessions = professionToOrganisations.map(
        (professionToOrganisation) =>
          Profession.withLatestLiveVersion(professionToOrganisation.profession),
      );

      expect(getNationsFromProfessionsSpy).toBeCalledWith(
        expectedProfessions,
        i18nService,
      );
    });
  });
});
