import organisationFactory from '../testutils/factories/organisation';
import professionFactory from '../testutils/factories/profession';
import { isConfirmed } from './is-confirmed';

describe('isConfirmed', () => {
  describe('when the entity has a slug set', () => {
    it('returns true', () => {
      const profession = professionFactory.build({ slug: 'profession-slug' });
      expect(isConfirmed(profession)).toEqual(true);

      const organisation = organisationFactory.build({
        slug: 'organisation-slug',
      });
      expect(isConfirmed(organisation)).toEqual(true);
    });
  });

  describe('when the entity has no slug', () => {
    it('returns false', () => {
      const profession = professionFactory.build({ slug: null });
      expect(isConfirmed(profession)).toEqual(false);

      const organisation = organisationFactory.build({ slug: undefined });
      expect(isConfirmed(organisation)).toEqual(false);
    });
  });
});
