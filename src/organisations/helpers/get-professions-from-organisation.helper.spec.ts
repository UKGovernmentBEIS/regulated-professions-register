import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { getProfessionsFromOrganisation } from './get-professions-from-organisation.helper';
import { ProfessionToOrganisation } from './../../professions/profession-to-organisation.entity';

describe('getProfessionsFromOrganisation', () => {
  describe('when there is only one profession', () => {
    it('returns a single-element array containing only that profession', () => {
      const profession = professionFactory.build();

      const organisation = organisationFactory.build({
        professionToOrganisations: [
          { profession: profession },
        ] as ProfessionToOrganisation[],
      });

      expect(getProfessionsFromOrganisation(organisation)).toEqual([
        profession,
      ]);
    });
  });

  describe('when there are two professions', () => {
    it('returns a two element array containing both professions', () => {
      const profession1 = professionFactory.build();
      const profession2 = professionFactory.build();

      const organisation = organisationFactory.build({
        professionToOrganisations: [
          { profession: profession1 },
          { profession: profession2 },
        ] as ProfessionToOrganisation[],
      });

      expect(getProfessionsFromOrganisation(organisation)).toEqual([
        profession1,
        profession2,
      ]);
    });
  });

  describe('when a profession is null', () => {
    it('filters any null items out', () => {
      const profession = professionFactory.build();

      const organisation = organisationFactory.build({
        professionToOrganisations: [
          { profession: profession },
          { profession: null },
        ] as ProfessionToOrganisation[],
      });

      expect(getProfessionsFromOrganisation(organisation)).toEqual([
        profession,
      ]);
    });
  });
});
