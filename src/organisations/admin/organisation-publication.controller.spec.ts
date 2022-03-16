import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { flashMessage } from '../../common/flash-message';
import { escape } from '../../helpers/escape.helper';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import userFactory from '../../testutils/factories/user';
import { translationOf } from '../../testutils/translation-of';
import { checkCanViewOrganisation } from '../../users/helpers/check-can-view-organisation';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { OrganisationVersionStatus } from '../organisation-version.entity';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { Organisation } from '../organisation.entity';
import { OrganisationsService } from '../organisations.service';
import { OrganisationPublicationController } from './organisation-publication.controller';

jest.mock('../../common/flash-message');
jest.mock('../../users/helpers/get-acting-user.helper');
jest.mock('../../helpers/escape.helper');
jest.mock('../../users/helpers/check-can-view-organisation');

describe('OrganisationPublicationController', () => {
  let controller: OrganisationPublicationController;

  let organisationsService: DeepMocked<OrganisationsService>;
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    organisationsService = createMock<OrganisationsService>();
    organisationVersionsService = createMock<OrganisationVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationPublicationController],
      providers: [
        {
          provide: OrganisationsService,
          useValue: organisationsService,
        },
        {
          provide: OrganisationVersionsService,
          useValue: organisationVersionsService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    controller = module.get<OrganisationPublicationController>(
      OrganisationPublicationController,
    );
  });

  describe('new', () => {
    it('fetches the Profession to render on the page', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation,
      });

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const result = await controller.new(organisation.id, version.id, request);

      expect(
        organisationVersionsService.findByIdWithOrganisation,
      ).toHaveBeenCalledWith(organisation.id, version.id);
      expect(result).toEqual({
        organisation: Organisation.withVersion(organisation, version),
      });
    });

    it('checks the acting user has permission to publish', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation,
      });

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.new(organisation.id, version.id, request);

      expect(checkCanViewOrganisation).toHaveBeenCalledWith(
        request,
        Organisation.withVersion(organisation, version),
      );
    });
  });

  describe('create', () => {
    describe('when publishing a brand new organisation', () => {
      it('should set the slug and publish the current version', async () => {
        const brandNewOrganisation = organisationFactory.build({
          slug: undefined,
        });
        const version = organisationVersionFactory.build({
          organisation: brandNewOrganisation,
          status: OrganisationVersionStatus.Unconfirmed,
        });
        const user = userFactory.build();

        const req = createDefaultMockRequest({
          user: userFactory.build(),
        });

        (getActingUser as jest.Mock).mockReturnValue(user);

        const res = createMock<Response>({});

        const flashMock = flashMessage as jest.Mock;
        flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

        organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
          version,
        );

        const newVersion = organisationVersionFactory.build({
          organisation: brandNewOrganisation,
          user,
        });

        organisationsService.find.mockResolvedValue(brandNewOrganisation);
        organisationVersionsService.create.mockResolvedValue(newVersion);

        await controller.create(req, res, brandNewOrganisation.id, version.id);

        expect(
          organisationVersionsService.findByIdWithOrganisation,
        ).toHaveBeenCalledWith(brandNewOrganisation.id, version.id);

        expect(organisationVersionsService.create).toHaveBeenCalledWith(
          version,
          user,
        );

        expect(organisationVersionsService.publish).toHaveBeenCalledWith(
          newVersion,
        );

        expect(organisationsService.setSlug).toHaveBeenCalledWith(
          brandNewOrganisation,
        );

        expect(flashMock).toHaveBeenCalledWith(
          translationOf('organisations.admin.publish.confirmation.heading'),
          translationOf('organisations.admin.publish.confirmation.body'),
        );

        expect(escape).toHaveBeenCalledWith(brandNewOrganisation.name);

        expect(req.flash).toHaveBeenCalledWith('success', 'STUB_FLASH_MESSAGE');

        expect(res.redirect).toHaveBeenCalledWith(
          `/admin/organisations/${brandNewOrganisation.id}/versions/${newVersion.id}`,
        );
      });
    });

    describe('when publishing an existing organisation', () => {
      it('should publish the current version', async () => {
        const existingOrganisation = organisationFactory.build({
          slug: 'org-slug',
        });
        const version = organisationVersionFactory.build({
          organisation: existingOrganisation,
        });
        const user = userFactory.build();

        const req = createDefaultMockRequest({
          user: userFactory.build(),
        });
        (getActingUser as jest.Mock).mockReturnValue(user);

        const res = createMock<Response>({});

        const flashMock = flashMessage as jest.Mock;
        flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

        organisationsService.find.mockResolvedValue(existingOrganisation);

        organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
          version,
        );

        const newVersion = organisationVersionFactory.build({
          organisation: existingOrganisation,
          user,
        });

        organisationVersionsService.create.mockResolvedValue(newVersion);

        await controller.create(req, res, existingOrganisation.id, version.id);

        expect(
          organisationVersionsService.findByIdWithOrganisation,
        ).toHaveBeenCalledWith(existingOrganisation.id, version.id);

        expect(organisationVersionsService.create).toHaveBeenCalledWith(
          version,
          user,
        );

        expect(organisationVersionsService.publish).toHaveBeenCalledWith(
          newVersion,
        );

        expect(flashMock).toHaveBeenCalledWith(
          translationOf('organisations.admin.publish.confirmation.heading'),
          translationOf('organisations.admin.publish.confirmation.body'),
        );

        expect(escape).toHaveBeenCalledWith(existingOrganisation.name);

        expect(organisationsService.setSlug).not.toHaveBeenCalled();

        expect(req.flash).toHaveBeenCalledWith('success', 'STUB_FLASH_MESSAGE');

        expect(res.redirect).toHaveBeenCalledWith(
          `/admin/organisations/${existingOrganisation.id}/versions/${newVersion.id}`,
        );
      });
    });

    it('checks the acting user has permission to publish', async () => {
      const organisation = organisationFactory.build({
        slug: 'org-slug',
      });
      const version = organisationVersionFactory.build({
        organisation: organisation,
      });

      const res = createMock<Response>({});

      const req = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.create(req, res, organisation.id, version.id);

      expect(checkCanViewOrganisation).toHaveBeenCalledWith(req, organisation);
    });
  });
});
