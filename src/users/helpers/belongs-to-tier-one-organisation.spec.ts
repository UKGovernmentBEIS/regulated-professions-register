import { belongsToTierOneOrganisation } from './belongs-to-tier-one-organisation';
import userFactory from '../../testutils/factories/user';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import * as getTierOneOrganisationsFromProfessionModule from '../../professions/helpers/get-tier-one-organisations-from-profession.helper';

describe('belongsToTierOneOrganisation', () => {
  describe('when the profession has no tier one organisations', () => {
    it('should return false', () => {
      const profession = professionFactory.build();
      const user = userFactory.build();

      const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
        getTierOneOrganisationsFromProfessionModule,
        'getTierOneOrganisationsFromProfession',
      );

      getTierOneOrganisationsFromProfessionSpy.mockReturnValue([]);

      expect(belongsToTierOneOrganisation(profession, user)).toBeFalsy();
    });
  });

  describe('when the profession has a tier one organisation, that the user does not belong to', () => {
    it('should return false', () => {
      const tierOneOrganisation = organisationFactory.build();
      const otherOrganisation = organisationFactory.build();

      const profession = professionFactory.build();
      const user = userFactory.build({ organisation: otherOrganisation });

      const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
        getTierOneOrganisationsFromProfessionModule,
        'getTierOneOrganisationsFromProfession',
      );

      getTierOneOrganisationsFromProfessionSpy.mockReturnValue([
        tierOneOrganisation,
      ]);

      expect(belongsToTierOneOrganisation(profession, user)).toBeFalsy();
    });
  });

  describe('when the profession has a tier one organisation, that the user belongs to', () => {
    it('should return truthy', () => {
      const tierOneOrganisation = organisationFactory.build();

      const profession = professionFactory.build();
      const user = userFactory.build({ organisation: tierOneOrganisation });

      const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
        getTierOneOrganisationsFromProfessionModule,
        'getTierOneOrganisationsFromProfession',
      );

      getTierOneOrganisationsFromProfessionSpy.mockReturnValue([
        tierOneOrganisation,
      ]);

      expect(belongsToTierOneOrganisation(profession, user)).toBeTruthy();
    });
  });
});
