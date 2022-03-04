import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { getOrganisationsFromProfession } from './get-organisations-from-profession.helper';

describe('getOrganisationsFromProfession', () => {
  describe('when the Organisation has only a main Organisation', () => {
    it('returns a single-element array containing only that organisation', () => {
      const organisation = organisationFactory.build();

      const profession = professionFactory.build({
        organisation,
      });

      expect(getOrganisationsFromProfession(profession)).toEqual([
        organisation,
      ]);
    });
  });

  describe('when the Organisation has a main Organisation and an additional Organisation', () => {
    it('returns a two element array containing both organisations', () => {
      const organisation = organisationFactory.build();
      const additionalOrganisation = organisationFactory.build();

      const profession = professionFactory.build({
        organisation,
        additionalOrganisation,
      });

      expect(getOrganisationsFromProfession(profession)).toEqual([
        organisation,
        additionalOrganisation,
      ]);
    });
  });

  describe('when the Organisation has only an additional Organisation', () => {
    it('returns a single-element array containing only that organisation', () => {
      const additionalOrganisation = organisationFactory.build();

      const profession = professionFactory.build({
        organisation: undefined,
        additionalOrganisation,
      });

      expect(getOrganisationsFromProfession(profession)).toEqual([
        additionalOrganisation,
      ]);
    });
  });
});
