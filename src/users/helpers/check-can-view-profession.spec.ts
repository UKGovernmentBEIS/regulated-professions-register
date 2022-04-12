import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import professionFactory from '../../testutils/factories/profession';
import { checkCanViewProfession } from './check-can-view-profession';
import userFactory from '../../testutils/factories/user';
import * as getActingUserModule from './get-acting-user.helper';
import * as belongsToTierOneOrganisationModule from './belongs-to-tier-one-organisation';
import organisationFactory from '../../testutils/factories/organisation';
import { UnauthorizedException } from '@nestjs/common';

describe('checkCanViewProfession', () => {
  describe('when called as a service owner user', () => {
    it('returns without throwing an Error', () => {
      const getActingUserSpy = jest.spyOn(getActingUserModule, 'getActingUser');
      const belongsToTierOneOrganisationSpy = jest.spyOn(
        belongsToTierOneOrganisationModule,
        'belongsToTierOneOrganisation',
      );

      const user = userFactory.build({ serviceOwner: true });
      const profession = professionFactory.build();

      getActingUserSpy.mockReturnValue(user);

      const request = createDefaultMockRequest({ user });

      expect(() => {
        checkCanViewProfession(request, profession);
      }).not.toThrowError();

      expect(getActingUserSpy).toBeCalledWith(request);
      expect(belongsToTierOneOrganisationSpy).not.toBeCalled();
    });
  });

  describe('when called as a non-service owner user', () => {
    describe('the acting user does not belong to a tier one organisation', () => {
      it('throws an UnauthorizedException', () => {
        const getActingUserSpy = jest.spyOn(
          getActingUserModule,
          'getActingUser',
        );
        const belongsToTierOneOrganisationSpy = jest.spyOn(
          belongsToTierOneOrganisationModule,
          'belongsToTierOneOrganisation',
        );

        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });
        const profession = professionFactory.build();

        getActingUserSpy.mockReturnValue(user);
        belongsToTierOneOrganisationSpy.mockReturnValue(false);

        const request = createDefaultMockRequest({ user });

        expect(() => {
          checkCanViewProfession(request, profession);
        }).toThrowError(UnauthorizedException);

        expect(getActingUserSpy).toBeCalledWith(request);
        expect(belongsToTierOneOrganisationSpy).toBeCalledWith(
          profession,
          user,
        );
      });
    });

    describe('the acting user belongs to a tier one organisation', () => {
      it('returns without throwing an Error', () => {
        const getActingUserSpy = jest.spyOn(
          getActingUserModule,
          'getActingUser',
        );
        const belongsToTierOneOrganisationSpy = jest.spyOn(
          belongsToTierOneOrganisationModule,
          'belongsToTierOneOrganisation',
        );

        const user = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });
        const profession = professionFactory.build();

        getActingUserSpy.mockReturnValue(user);
        belongsToTierOneOrganisationSpy.mockReturnValue(true);

        const request = createDefaultMockRequest({ user });

        expect(() => {
          checkCanViewProfession(request, profession);
        }).not.toThrowError();

        expect(getActingUserSpy).toBeCalledWith(request);
        expect(belongsToTierOneOrganisationSpy).toBeCalledWith(
          profession,
          user,
        );
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
