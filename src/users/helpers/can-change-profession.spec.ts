import professionFactory from '../../testutils/factories/profession';
import { canChangeProfession } from './can-change-profession';
import userFactory from '../../testutils/factories/user';
import * as getActingUserModule from './get-acting-user.helper';
import * as getTierOneOrganisationsFromProfessionModule from '../../professions/helpers/get-tier-one-organisations-from-profession.helper';
import organisationFactory from '../../testutils/factories/organisation';

describe('canChangeProfession', () => {
  describe('when called as a service owner user', () => {
    it('returns true', () => {
      const getActingUserSpy = jest.spyOn(getActingUserModule, 'getActingUser');
      const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
        getTierOneOrganisationsFromProfessionModule,
        'getTierOneOrganisationsFromProfession',
      );

      const user = userFactory.build({ serviceOwner: true });
      const profession = professionFactory.build();

      getActingUserSpy.mockReturnValue(user);

      expect(canChangeProfession(user, profession)).toBeTruthy();

      expect(getTierOneOrganisationsFromProfessionSpy).not.toBeCalled();
    });
  });

  describe('when called as a non-service owner user', () => {
    describe('the profession has no tier-one organisations', () => {
      it('returns false', () => {
        const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
          getTierOneOrganisationsFromProfessionModule,
          'getTierOneOrganisationsFromProfession',
        );

        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });
        const profession = professionFactory.build();

        getTierOneOrganisationsFromProfessionSpy.mockReturnValue([]);

        expect(canChangeProfession(user, profession)).toBeFalsy();

        expect(getTierOneOrganisationsFromProfessionSpy).toBeCalledWith(
          profession,
        );
      });
    });

    describe("the profession has one tier-one organisation, which matches the user's", () => {
      it('returns true', () => {
        const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
          getTierOneOrganisationsFromProfessionModule,
          'getTierOneOrganisationsFromProfession',
        );

        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });
        const profession = professionFactory.build();

        getTierOneOrganisationsFromProfessionSpy.mockReturnValue([
          user.organisation,
        ]);

        expect(canChangeProfession(user, profession)).toBeTruthy();

        expect(getTierOneOrganisationsFromProfessionSpy).toBeCalledWith(
          profession,
        );
      });
    });

    describe("the profession has one tier-one organisation, which does not match the user's", () => {
      it('returns false', () => {
        const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
          getTierOneOrganisationsFromProfessionModule,
          'getTierOneOrganisationsFromProfession',
        );

        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });
        const profession = professionFactory.build();

        getTierOneOrganisationsFromProfessionSpy.mockReturnValue([
          organisationFactory.build(),
        ]);

        expect(canChangeProfession(user, profession)).toBeFalsy();

        expect(getTierOneOrganisationsFromProfessionSpy).toBeCalledWith(
          profession,
        );
      });
    });

    describe("the profession has one tier-one organisation, which matches the user's, and another tier-one organisation, which does not", () => {
      it('returns true', () => {
        const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
          getTierOneOrganisationsFromProfessionModule,
          'getTierOneOrganisationsFromProfession',
        );

        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });

        const profession = professionFactory.build();

        getTierOneOrganisationsFromProfessionSpy.mockReturnValue([
          user.organisation,
          organisationFactory.build(),
        ]);

        expect(canChangeProfession(user, profession)).toBeTruthy();

        expect(getTierOneOrganisationsFromProfessionSpy).toBeCalledWith(
          profession,
        );
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
