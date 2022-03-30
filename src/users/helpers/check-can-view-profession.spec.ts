import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import professionFactory from '../../testutils/factories/profession';
import { checkCanViewProfession } from './check-can-view-profession';
import userFactory from '../../testutils/factories/user';
import * as getActingUserModule from './get-acting-user.helper';
import * as getTierOneOrganisationsFromProfessionModule from '../../professions/helpers/get-tier-one-organisations-from-profession.helper';
import organisationFactory from '../../testutils/factories/organisation';
import { UnauthorizedException } from '@nestjs/common';

describe('checkCanViewProfession', () => {
  describe('when called as a service owner user', () => {
    it('returns without throwing an Error', () => {
      const getActingUserSpy = jest.spyOn(getActingUserModule, 'getActingUser');
      const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
        getTierOneOrganisationsFromProfessionModule,
        'getTierOneOrganisationsFromProfession',
      );

      const user = userFactory.build({ serviceOwner: true });
      const profession = professionFactory.build();

      getActingUserSpy.mockReturnValue(user);

      const request = createDefaultMockRequest({ user });

      expect(() => {
        checkCanViewProfession(request, profession);
      }).not.toThrowError();

      expect(getActingUserSpy).toBeCalledWith(request);
      expect(getTierOneOrganisationsFromProfessionSpy).not.toBeCalled();
    });
  });

  describe('when called as a non-service owner user', () => {
    describe('the profession has no tier-one organisations', () => {
      it('throws an UnauthorizedException', () => {
        const getActingUserSpy = jest.spyOn(
          getActingUserModule,
          'getActingUser',
        );
        const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
          getTierOneOrganisationsFromProfessionModule,
          'getTierOneOrganisationsFromProfession',
        );

        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });
        const profession = professionFactory.build();

        getActingUserSpy.mockReturnValue(user);
        getTierOneOrganisationsFromProfessionSpy.mockReturnValue([]);

        const request = createDefaultMockRequest({ user });

        expect(() => {
          checkCanViewProfession(request, profession);
        }).toThrowError(UnauthorizedException);

        expect(getActingUserSpy).toBeCalledWith(request);
        expect(getTierOneOrganisationsFromProfessionSpy).toBeCalledWith(
          profession,
        );
      });
    });

    describe("the profession has one tier-one organisation, which matches the user's", () => {
      it('returns without throwing an Error', () => {
        const getActingUserSpy = jest.spyOn(
          getActingUserModule,
          'getActingUser',
        );
        const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
          getTierOneOrganisationsFromProfessionModule,
          'getTierOneOrganisationsFromProfession',
        );

        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });
        const profession = professionFactory.build();

        getActingUserSpy.mockReturnValue(user);
        getTierOneOrganisationsFromProfessionSpy.mockReturnValue([
          user.organisation,
        ]);

        const request = createDefaultMockRequest({ user });

        expect(() => {
          checkCanViewProfession(request, profession);
        }).not.toThrowError();

        expect(getActingUserSpy).toBeCalledWith(request);
        expect(getTierOneOrganisationsFromProfessionSpy).toBeCalledWith(
          profession,
        );
      });
    });

    describe("the profession has one tier-one organisation, which does not matches the user's", () => {
      it('returns without throwing an Error', () => {
        const getActingUserSpy = jest.spyOn(
          getActingUserModule,
          'getActingUser',
        );
        const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
          getTierOneOrganisationsFromProfessionModule,
          'getTierOneOrganisationsFromProfession',
        );

        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });
        const profession = professionFactory.build();

        getActingUserSpy.mockReturnValue(user);
        getTierOneOrganisationsFromProfessionSpy.mockReturnValue([
          organisationFactory.build(),
        ]);

        const request = createDefaultMockRequest({ user });

        expect(() => {
          checkCanViewProfession(request, profession);
        }).toThrowError(UnauthorizedException);

        expect(getActingUserSpy).toBeCalledWith(request);
        expect(getTierOneOrganisationsFromProfessionSpy).toBeCalledWith(
          profession,
        );
      });
    });

    describe("the profession has one tier-one organisation, which matches the user's, and another tier-one organisation, which does not", () => {
      it('returns without throwing an Error', () => {
        const getActingUserSpy = jest.spyOn(
          getActingUserModule,
          'getActingUser',
        );
        const getTierOneOrganisationsFromProfessionSpy = jest.spyOn(
          getTierOneOrganisationsFromProfessionModule,
          'getTierOneOrganisationsFromProfession',
        );

        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });
        const profession = professionFactory.build();

        getActingUserSpy.mockReturnValue(user);
        getTierOneOrganisationsFromProfessionSpy.mockReturnValue([
          user.organisation,
          organisationFactory.build(),
        ]);

        const request = createDefaultMockRequest({ user });

        expect(() => {
          checkCanViewProfession(request, profession);
        }).not.toThrowError();

        expect(getActingUserSpy).toBeCalledWith(request);
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
