import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';
import { SelectItemArgs } from '../../common/interfaces/select-item-args.interface';
import { OrganisationsService } from '../../organisations/organisations.service';
import { RegulatedAuthoritiesSelectPresenter } from '../../professions/admin/presenters/regulated-authorities-select-presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createMockRequest } from '../../testutils/create-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import userFactory from '../../testutils/factories/user';
import { ServiceOwnerRadioButtonArgsPresenter } from '../presenters/service-owner-radio-buttons.presenter';
import { UsersService } from '../users.service';
import { OrganisationDto } from './dto/organisation.dto';
import { OrganisationController } from './organisation.controller';
import { getActionTypeFromUser } from '../helpers/get-action-type-from-user';
import { checkUserIsServiceOwner } from '../helpers/check-user-is-service-owner.helper';

jest.mock(
  '../../professions/admin/presenters/regulated-authorities-select-presenter',
);
jest.mock('../presenters/service-owner-radio-buttons.presenter');
jest.mock('../helpers/get-action-type-from-user');
jest.mock('../helpers/check-user-is-service-owner.helper');

describe('OrganisationController', () => {
  let controller: OrganisationController;
  let usersService: DeepMocked<UsersService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    usersService = createMock<UsersService>();
    organisationsService = createMock<OrganisationsService>();
    i18nService = createMockI18nService();

    const module = await Test.createTestingModule({
      controllers: [OrganisationController],
      providers: [
        {
          provide: I18nService,
          useValue: i18nService,
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
      it('throws an exception', async () => {
        (checkUserIsServiceOwner as jest.Mock).mockImplementation(() => {
          throw new UnauthorizedException();
        });

        const user = userFactory.build({ serviceOwner: false });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user },
        );

        const response = createMock<Response>();

        await expect(
          controller.edit(request, response, 'user-id', null),
        ).rejects.toThrowError(UnauthorizedException);

        expect(checkUserIsServiceOwner).toBeCalledWith(request);
      });
    });

    describe('when logged in as a service owner user', () => {
      it('renders an "edit" template for the user', async () => {
        (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

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
        ).radioButtonArgs.mockReturnValue(serviceOwnerRadioButtonArgs);

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

        await controller.edit(request, response, user.id, null);

        expect(checkUserIsServiceOwner).toBeCalledWith(request);

        expect(response.render).toBeCalledWith(
          'admin/users/organisation/edit',
          expect.objectContaining({
            action: 'edit',
            organisationsSelectArgs,
            serviceOwnerRadioButtonArgs,
            name: user.name,
          }),
        );

        expect(usersService.find).toBeCalledWith(user.id);

        expect(RegulatedAuthoritiesSelectPresenter).toBeCalledWith(
          [organisation1, organisation2],
          organisation1,
          null,
          i18nService,
        );
        expect(
          RegulatedAuthoritiesSelectPresenter.prototype.selectArgs,
        ).toBeCalled();

        expect(ServiceOwnerRadioButtonArgsPresenter).toBeCalledWith(
          false,
          i18nService,
        );
        expect(
          ServiceOwnerRadioButtonArgsPresenter.prototype.radioButtonArgs,
        ).toBeCalled();
      });
    });
  });

  describe('update', () => {
    describe('when logged in as a non-service owner user', () => {
      it('throws an exception', async () => {
        (checkUserIsServiceOwner as jest.Mock).mockImplementation(() => {
          throw new UnauthorizedException();
        });

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

        expect(usersService.save).not.toBeCalled();

        expect(checkUserIsServiceOwner).toBeCalledWith(request);
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
          source: null,
        };

        usersService.find.mockResolvedValue(user);
        organisationsService.find.mockResolvedValue(organisation);

        await controller.update(request, response, user.id, organisationDto);

        expect(checkUserIsServiceOwner).toBeCalledWith(request);

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
        (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

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
        ).radioButtonArgs.mockReturnValue(serviceOwnerRadioButtonArgs);

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
          source: null,
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
            action: 'edit',
            organisationsSelectArgs,
            serviceOwnerRadioButtonArgs,
            name: user.name,
          }),
        );

        expect(checkUserIsServiceOwner).toBeCalledWith(request);

        expect(usersService.find).toBeCalledWith(user.id);
        expect(usersService.save).not.toBeCalled();
        expect(organisationsService.find).not.toBeCalled();

        expect(RegulatedAuthoritiesSelectPresenter).toBeCalledWith(
          [organisation1, organisation2],
          undefined,
          null,
          i18nService,
        );
        expect(
          RegulatedAuthoritiesSelectPresenter.prototype.selectArgs,
        ).toBeCalled();

        expect(ServiceOwnerRadioButtonArgsPresenter).toBeCalledWith(
          false,
          i18nService,
        );
        expect(
          ServiceOwnerRadioButtonArgsPresenter.prototype.radioButtonArgs,
        ).toBeCalled();
      });

      it('does not check for the presence of an organisation when creating a service-owner user', async () => {
        (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

        const serviceOwnerUser = userFactory.build({ serviceOwner: true });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user: serviceOwnerUser },
        );

        const response = createMock<Response>();
        const user = userFactory.build();
        const organisationDto: OrganisationDto = {
          serviceOwner: '1',
          organisation: undefined,
          source: null,
        };

        usersService.find.mockResolvedValue(user);

        await controller.update(request, response, user.id, organisationDto);

        expect(checkUserIsServiceOwner).toBeCalledWith(request);

        expect(organisationsService.find).not.toHaveBeenCalled();
        expect(usersService.save).toBeCalledWith({
          ...user,
          serviceOwner: true,
        });
        expect(response.redirect).toBeCalledWith(
          `/admin/users/${user.id}/personal-details/edit`,
        );
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
