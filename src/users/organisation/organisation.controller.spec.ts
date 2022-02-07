import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';
import { SelectItemArgs } from '../../common/interfaces/select-item-args.interface';
import { OrganisationsService } from '../../organisations/organisations.service';
import { RegulatedAuthoritiesSelectPresenter } from '../../professions/admin/regulated-authorities-select-presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createMockRequest } from '../../testutils/create-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import userFactory from '../../testutils/factories/user';
import { ServiceOwnerRadioButtonArgsPresenter } from '../service-owner-radio-buttons-presenter';
import { UsersService } from '../users.service';
import { OrganisationDto } from './dto/organisation.dto';
import { OrganisationController } from './organisation.controller';

jest.mock('../../professions/admin/regulated-authorities-select-presenter');
jest.mock('../service-owner-radio-buttons-presenter');

describe('OrganisationController', () => {
  let controller: OrganisationController;
  let usersService: DeepMocked<UsersService>;
  let organisationsService: DeepMocked<OrganisationsService>;

  beforeEach(async () => {
    usersService = createMock<UsersService>();
    organisationsService = createMock<OrganisationsService>();

    const module = await Test.createTestingModule({
      controllers: [OrganisationController],
      providers: [
        {
          provide: I18nService,
          useValue: createMockI18nService(),
        },
        {
          provide: OrganisationsService,
          useValue: organisationsService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<OrganisationController>(OrganisationController);
  });

  describe('edit', () => {
    describe('when logged in as a non-service owner user', () => {
      it('throws an exception ', async () => {
        const user = userFactory.build({ serviceOwner: false });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user },
        );

        const response = createMock<Response>();

        await expect(
          controller.edit(request, response, 'user-id', false),
        ).rejects.toThrowError(UnauthorizedException);
      });
    });

    describe('when logged in as a service owner user', () => {
      it('renders an "edit" template for the user', async () => {
        const organisationsSelectArgs: SelectItemArgs[] = [
          {
            value: 'organisation-id',
            text: 'Organisation Name',
            selected: true,
          },
        ];

        const serviceOwnerRadioButtonArgs: RadioButtonArgs[] = [
          {
            value: '1',
            text: 'Service Owner',
            checked: false,
          },
        ];

        (
          RegulatedAuthoritiesSelectPresenter.prototype as DeepMocked<RegulatedAuthoritiesSelectPresenter>
        ).selectArgs.mockReturnValue(organisationsSelectArgs);
        (
          ServiceOwnerRadioButtonArgsPresenter.prototype as DeepMocked<ServiceOwnerRadioButtonArgsPresenter>
        ).radioButtonArgs.mockResolvedValue(serviceOwnerRadioButtonArgs);

        const serviceOwnerUser = userFactory.build({ serviceOwner: true });

        const organisation1 = organisationFactory.build();
        const organisation2 = organisationFactory.build();

        const user = userFactory.build({ organisation: organisation1 });

        organisationsService.all.mockResolvedValue([
          organisation1,
          organisation2,
        ]);
        usersService.find.mockResolvedValue(user);

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user: serviceOwnerUser },
        );

        const response = createMock<Response>();

        await controller.edit(request, response, user.id, false);

        expect(response.render).toBeCalledWith(
          'admin/users/organisation/edit',
          expect.objectContaining({
            organisationsSelectArgs,
            serviceOwnerRadioButtonArgs,
          }),
        );

        expect(usersService.find).toBeCalledWith(user.id);

        expect(RegulatedAuthoritiesSelectPresenter).toBeCalledWith(
          [organisation1, organisation2],
          organisation1,
        );
        expect(
          RegulatedAuthoritiesSelectPresenter.prototype.selectArgs,
        ).toBeCalled();

        expect(ServiceOwnerRadioButtonArgsPresenter).toBeCalledWith(false, {});
        expect(
          ServiceOwnerRadioButtonArgsPresenter.prototype.radioButtonArgs,
        ).toBeCalled();
      });
    });
  });

  describe('update', () => {
    describe('when logged in as a non-service owner user', () => {
      it('throws an exception', async () => {
        const user = userFactory.build({ serviceOwner: false });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user },
        );

        const response = createMock<Response>();

        await expect(
          controller.update(request, response, 'user-id', false),
        ).rejects.toThrowError(UnauthorizedException);
      });
    });

    describe('when logged in as a service owner user', () => {
      it('updates the user and redirects to the next step in the user creation flow if the DTO is valid', async () => {
        const user = userFactory.build();
        const organisation = organisationFactory.build();

        const serviceOwnerUser = userFactory.build({ serviceOwner: true });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user: serviceOwnerUser },
        );

        const response = createMock<Response>();

        const organisationDto: OrganisationDto = {
          serviceOwner: '0',
          organisation: organisation.id,
          change: 'false',
        };

        usersService.find.mockResolvedValue(user);
        organisationsService.find.mockResolvedValue(organisation);

        await controller.update(request, response, user.id, organisationDto);

        expect(organisationsService.find).toBeCalledWith(organisation.id);
        expect(usersService.save).toBeCalledWith({
          ...user,
          organisation,
          serviceOwner: false,
        });
        expect(response.redirect).toBeCalledWith(
          `/admin/users/${user.id}/personal-details/edit`,
        );
      });

      it('renders the "edit" template if the DTO is invalid', async () => {
        const organisationsSelectArgs: SelectItemArgs[] = [
          {
            value: 'organisation-id',
            text: 'Organisation Name',
            selected: true,
          },
        ];

        const serviceOwnerRadioButtonArgs: RadioButtonArgs[] = [
          {
            value: '1',
            text: 'Service Owner',
            checked: false,
          },
        ];

        (
          RegulatedAuthoritiesSelectPresenter.prototype as DeepMocked<RegulatedAuthoritiesSelectPresenter>
        ).selectArgs.mockReturnValue(organisationsSelectArgs);
        (
          ServiceOwnerRadioButtonArgsPresenter.prototype as DeepMocked<ServiceOwnerRadioButtonArgsPresenter>
        ).radioButtonArgs.mockResolvedValue(serviceOwnerRadioButtonArgs);

        const user = userFactory.build();

        const organisation1 = organisationFactory.build();
        const organisation2 = organisationFactory.build();

        const serviceOwnerUser = userFactory.build({ serviceOwner: true });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user: serviceOwnerUser },
        );

        const response = createMock<Response>();

        const organisationDto: OrganisationDto = {
          serviceOwner: '0',
          organisation: undefined,
          change: 'false',
        };

        usersService.find.mockResolvedValue(user);
        organisationsService.all.mockResolvedValue([
          organisation1,
          organisation2,
        ]);
        organisationsService.find.mockResolvedValue(undefined);

        await controller.update(request, response, user.id, organisationDto);

        expect(response.render).toBeCalledWith(
          'admin/users/organisation/edit',
          expect.objectContaining({
            organisationsSelectArgs,
            serviceOwnerRadioButtonArgs,
          }),
        );

        expect(usersService.find).toBeCalledWith(user.id);
        expect(usersService.save).not.toBeCalled();
        expect(organisationsService.find).toBeCalledWith(undefined);

        expect(RegulatedAuthoritiesSelectPresenter).toBeCalledWith(
          [organisation1, organisation2],
          undefined,
        );
        expect(
          RegulatedAuthoritiesSelectPresenter.prototype.selectArgs,
        ).toBeCalled();

        expect(ServiceOwnerRadioButtonArgsPresenter).toBeCalledWith(false, {});
        expect(
          ServiceOwnerRadioButtonArgsPresenter.prototype.radioButtonArgs,
        ).toBeCalled();
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
