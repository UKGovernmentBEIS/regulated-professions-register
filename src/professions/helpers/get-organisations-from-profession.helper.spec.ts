import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { getOrganisationsFromProfession } from './get-organisations-from-profession.helper';
import { ProfessionToOrganisation } from '../profession-to-organisation.entity';

describe('getOrganisationsFromProfession', () => {
  describe('when the Organisation has one organisation', () => {
    it('returns a single-element array containing only that organisation', () => {
      const organisation = organisationFactory.build();

      const profession = professionFactory.build({
        professionToOrganisations: [
          { organisation: organisation },
        ] as ProfessionToOrganisation[],
      });

      expect(getOrganisationsFromProfession(profession)).toEqual([
        organisation,
      ]);
    });
  });

  describe('when the Organisation has two organisations', () => {
    it('returns a two element array containing both organisations', () => {
      const organisation = organisationFactory.build();
      const additionalOrganisation = organisationFactory.build();

      const profession = professionFactory.build({
        professionToOrganisations: [
          { organisation: organisation },
          { organisation: additionalOrganisation },
        ] as ProfessionToOrganisation[],
      });

      expect(getOrganisationsFromProfession(profession)).toEqual([
        organisation,
        additionalOrganisation,
      ]);
    });
  });

  describe('when an organisation is null', () => {
    it('filters any null items out', () => {
      const organisation = organisationFactory.build();

      const profession = professionFactory.build({
        professionToOrganisations: [
          { organisation: organisation },
          { organisation: null },
        ] as ProfessionToOrganisation[],
      });

      expect(getOrganisationsFromProfession(profession)).toEqual([
        organisation,
      ]);
    });
  });
});
