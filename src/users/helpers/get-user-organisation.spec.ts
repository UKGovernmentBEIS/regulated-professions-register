import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import organisationFactory from '../../testutils/factories/organisation';
import userFactory from '../../testutils/factories/user';
import { translationOf } from '../../testutils/translation-of';
import { getUserOrganisation } from './get-user-organisation';

describe('getUserOrganisation', () => {
  describe('when the user is a service owner', () => {
    it('returns the BEIS team translated string', () => {
      const user = userFactory.build({ serviceOwner: true });

      const i18nService = createMockI18nService();

      expect(getUserOrganisation(user, i18nService)).toEqual(
        translationOf('app.beis'),
      );
      expect(i18nService.translate).toHaveBeenCalledWith('app.beis');
    });
  });

  describe('when the user is not a service owner', () => {
    it('returns the BEIS team translation string', () => {
      const user = userFactory.build({
        serviceOwner: false,
        organisation: organisationFactory.build({
          name: 'Department for Education',
        }),
      });

      const i18nService = createMockI18nService();

      expect(getUserOrganisation(user, i18nService)).toEqual(
        'Department for Education',
      );
      expect(i18nService.translate).not.toHaveBeenCalled();
    });
  });
});
