import { createDefaultMockRequest } from '../../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../../testutils/factories/organisation';
import professionFactory from '../../../testutils/factories/profession';
import userFactory from '../../../testutils/factories/user';
import * as getActingUserModule from '../../../users/helpers/get-acting-user.helper';
import { checkCanChangeDataset } from './check-can-change-dataset.helper';
import * as getDecisionsYearsRangeModule from './get-decisions-years-range';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as getOrganisationsFromProfessionModule from '../../../professions/helpers/get-organisations-from-profession.helper';

describe('checkCanChangeDataset', () => {
  describe('when the acting user is a service owner', () => {
    describe('when the dataset does not exist', () => {
      describe('when the given Profession is not part of the given Organisation', () => {
        it('throws a BadRequestException', () => {
          const user = userFactory.build({
            serviceOwner: true,
          });

          const requestOrganistion = organisationFactory.build();

          const profession = professionFactory.build();
          const professionOrganisation = organisationFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest
            .spyOn(
              getOrganisationsFromProfessionModule,
              'getOrganisationsFromProfession',
            )
            .mockReturnValue([professionOrganisation]);
          const getDecisionsYearsRangeSpy = jest.spyOn(
            getDecisionsYearsRangeModule,
            'getDecisionsYearsRange',
          );

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              requestOrganistion,
              2020,
              false,
            );
          }).toThrowError(BadRequestException);

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
            profession,
          );
          expect(getDecisionsYearsRangeSpy).not.toHaveBeenCalled();
        });
      });

      describe('when the given year is before the earliest allowed year', () => {
        it('throws a BadRequestException', () => {
          const user = userFactory.build({
            serviceOwner: true,
          });

          const organisation = organisationFactory.build();

          const profession = professionFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest
            .spyOn(
              getOrganisationsFromProfessionModule,
              'getOrganisationsFromProfession',
            )
            .mockReturnValue([organisation]);
          const getDecisionsYearsRangeSpy = jest
            .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
            .mockReturnValue({ start: 2018, end: 2024 });

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              organisation,
              2017,
              false,
            );
          }).toThrowError(BadRequestException);

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
            profession,
          );
          expect(getDecisionsYearsRangeSpy).toHaveBeenCalled();
        });
      });

      describe('when the given year is after the lastest allowed year', () => {
        it('throws a BadRequestException', () => {
          const user = userFactory.build({
            serviceOwner: true,
          });

          const organisation = organisationFactory.build();

          const profession = professionFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest
            .spyOn(
              getOrganisationsFromProfessionModule,
              'getOrganisationsFromProfession',
            )
            .mockReturnValue([organisation]);
          const getDecisionsYearsRangeSpy = jest
            .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
            .mockReturnValue({ start: 2018, end: 2024 });

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              organisation,
              2025,
              false,
            );
          }).toThrowError(BadRequestException);

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
            profession,
          );
          expect(getDecisionsYearsRangeSpy).toHaveBeenCalled();
        });
      });

      describe('when the Profession is part of the given Organisation, and the year is in the allowed range', () => {
        it('does not throw an exception', () => {
          const user = userFactory.build({
            serviceOwner: true,
          });

          const organisation = organisationFactory.build();

          const profession = professionFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest
            .spyOn(
              getOrganisationsFromProfessionModule,
              'getOrganisationsFromProfession',
            )
            .mockReturnValue([organisation]);
          const getDecisionsYearsRangeSpy = jest
            .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
            .mockReturnValue({ start: 2018, end: 2024 });

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              organisation,
              2020,
              false,
            );
          }).not.toThrowError();

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
            profession,
          );
          expect(getDecisionsYearsRangeSpy).toHaveBeenCalled();
        });
      });
    });

    describe('when the dataset does exist', () => {
      it('does not check that the given Profession is part of the given Organisation, does not check the year is in the allowed range and does not throw an exception', () => {
        const user = userFactory.build({
          serviceOwner: true,
        });

        const organisation = organisationFactory.build();

        const profession = professionFactory.build();

        const request = createDefaultMockRequest();

        const getActingUserSpy = jest
          .spyOn(getActingUserModule, 'getActingUser')
          .mockReturnValue(user);
        const getOrganisationsFromProfessionSpy = jest.spyOn(
          getOrganisationsFromProfessionModule,
          'getOrganisationsFromProfession',
        );
        const getDecisionsYearsRangeSpy = jest.spyOn(
          getDecisionsYearsRangeModule,
          'getDecisionsYearsRange',
        );

        expect(() => {
          checkCanChangeDataset(request, profession, organisation, 2026, true);
        }).not.toThrowError();

        expect(getActingUserSpy).toHaveBeenCalledWith(request);
        expect(getOrganisationsFromProfessionSpy).not.toHaveBeenCalled();
        expect(getDecisionsYearsRangeSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('when the acting user is a non-service owner', () => {
    describe('when the dataset does not exist', () => {
      describe('when the acting user is not part of the given Organisation', () => {
        it('throws an UnauthorizedException', () => {
          const userAndProfessionOrganisation = organisationFactory.build();

          const user = userFactory.build({
            serviceOwner: false,
            organisation: userAndProfessionOrganisation,
          });

          const requestOrganisation = organisationFactory.build();

          const profession = professionFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest
            .spyOn(
              getOrganisationsFromProfessionModule,
              'getOrganisationsFromProfession',
            )
            .mockReturnValue([userAndProfessionOrganisation]);
          const getDecisionsYearsRangeSpy = jest.spyOn(
            getDecisionsYearsRangeModule,
            'getDecisionsYearsRange',
          );

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              requestOrganisation,
              2020,
              false,
            );
          }).toThrowError(UnauthorizedException);

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).not.toHaveBeenCalled();
          expect(getDecisionsYearsRangeSpy).not.toHaveBeenCalled();
        });
      });

      describe('when the given Profession is not part of the given Organisation', () => {
        it('throws a BadRequestException', () => {
          const userAndRequestOrganisation = organisationFactory.build();

          const user = userFactory.build({
            serviceOwner: false,
            organisation: userAndRequestOrganisation,
          });

          const profession = professionFactory.build();
          const professionOrganisation = organisationFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest
            .spyOn(
              getOrganisationsFromProfessionModule,
              'getOrganisationsFromProfession',
            )
            .mockReturnValue([professionOrganisation]);
          const getDecisionsYearsRangeSpy = jest.spyOn(
            getDecisionsYearsRangeModule,
            'getDecisionsYearsRange',
          );

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              userAndRequestOrganisation,
              2020,
              false,
            );
          }).toThrowError(BadRequestException);

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
            profession,
          );
          expect(getDecisionsYearsRangeSpy).not.toHaveBeenCalled();
        });
      });

      describe('when the given year is before the earliest allowed year', () => {
        it('throws a BadRequestException', () => {
          const organisation = organisationFactory.build();

          const user = userFactory.build({
            serviceOwner: false,
            organisation,
          });

          const profession = professionFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest
            .spyOn(
              getOrganisationsFromProfessionModule,
              'getOrganisationsFromProfession',
            )
            .mockReturnValue([organisation]);
          const getDecisionsYearsRangeSpy = jest
            .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
            .mockReturnValue({ start: 2018, end: 2024 });

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              organisation,
              2017,
              false,
            );
          }).toThrowError(BadRequestException);

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
            profession,
          );
          expect(getDecisionsYearsRangeSpy).toHaveBeenCalled();
        });
      });

      describe('when the given year is after the lastest allowed year', () => {
        it('throws a BadRequestException', () => {
          const organisation = organisationFactory.build();

          const user = userFactory.build({
            serviceOwner: false,
            organisation,
          });

          const profession = professionFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest
            .spyOn(
              getOrganisationsFromProfessionModule,
              'getOrganisationsFromProfession',
            )
            .mockReturnValue([organisation]);
          const getDecisionsYearsRangeSpy = jest
            .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
            .mockReturnValue({ start: 2018, end: 2024 });

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              organisation,
              2025,
              false,
            );
          }).toThrowError(BadRequestException);

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
            profession,
          );
          expect(getDecisionsYearsRangeSpy).toHaveBeenCalled();
        });
      });

      describe('when the Profession is part of the given Organisation, and the year is in the allowed range', () => {
        it('does not throw an exception', () => {
          const organisation = organisationFactory.build();

          const user = userFactory.build({
            serviceOwner: false,
            organisation,
          });

          const profession = professionFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest
            .spyOn(
              getOrganisationsFromProfessionModule,
              'getOrganisationsFromProfession',
            )
            .mockReturnValue([organisation]);
          const getDecisionsYearsRangeSpy = jest
            .spyOn(getDecisionsYearsRangeModule, 'getDecisionsYearsRange')
            .mockReturnValue({ start: 2018, end: 2024 });

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              organisation,
              2020,
              false,
            );
          }).not.toThrowError();

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).toHaveBeenCalledWith(
            profession,
          );
          expect(getDecisionsYearsRangeSpy).toHaveBeenCalled();
        });
      });
    });

    describe('when the dataset does exist', () => {
      describe('when the acting user is not part of the given Organisation', () => {
        it('throws an UnauthorizedException', () => {
          const userAndProfessionOrganisation = organisationFactory.build();

          const user = userFactory.build({
            serviceOwner: false,
            organisation: userAndProfessionOrganisation,
          });

          const requestOrganisation = organisationFactory.build();

          const profession = professionFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest
            .spyOn(
              getOrganisationsFromProfessionModule,
              'getOrganisationsFromProfession',
            )
            .mockReturnValue([userAndProfessionOrganisation]);
          const getDecisionsYearsRangeSpy = jest.spyOn(
            getDecisionsYearsRangeModule,
            'getDecisionsYearsRange',
          );

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              requestOrganisation,
              2020,
              true,
            );
          }).toThrowError(UnauthorizedException);

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).not.toHaveBeenCalled();
          expect(getDecisionsYearsRangeSpy).not.toHaveBeenCalled();
        });
      });

      describe('when the acting user is part of the given Organisation', () => {
        it('does not check that the given Profession is part of the given Organisation, does not check the year is in the allowed range, and does not throw an exception', () => {
          const organisation = organisationFactory.build();

          const user = userFactory.build({
            serviceOwner: false,
            organisation,
          });

          const profession = professionFactory.build();

          const request = createDefaultMockRequest();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);
          const getOrganisationsFromProfessionSpy = jest.spyOn(
            getOrganisationsFromProfessionModule,
            'getOrganisationsFromProfession',
          );
          const getDecisionsYearsRangeSpy = jest.spyOn(
            getDecisionsYearsRangeModule,
            'getDecisionsYearsRange',
          );

          expect(() => {
            checkCanChangeDataset(
              request,
              profession,
              organisation,
              2026,
              true,
            );
          }).not.toThrowError();

          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(getOrganisationsFromProfessionSpy).not.toHaveBeenCalled();
          expect(getDecisionsYearsRangeSpy).not.toHaveBeenCalled();
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});
