import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { translationOf } from '../../testutils/translation-of';

import { OrganisationVersionsController } from './organisation-versions.controller';

import { OrganisationVersionsService } from '../organisation-versions.service';
import { OrganisationsService } from '../organisations.service';

import { Organisation } from '../organisation.entity';

import { OrganisationSummaryPresenter } from '../presenters/organisation-summary.presenter';

import { ShowTemplate } from '../interfaces/show-template.interface';

import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import userFactory from '../../testutils/factories/user';

import { createMockI18nService } from '../../testutils/create-mock-i18n-service';

import { OrganisationPresenter } from '../presenters/organisation.presenter';

import { flashMessage } from '../../common/flash-message';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';

jest.mock('../presenters/organisation-summary.presenter');
jest.mock('../presenters/organisation.presenter');
jest.mock('../../common/flash-message');
jest.mock('../../users/helpers/get-acting-user.helper');

describe('OrganisationVersionsController', () => {
  let controller: OrganisationVersionsController;

  let i18nService: I18nService;

  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;

  beforeEach(async () => {
    organisationsService = createMock<OrganisationsService>();
    organisationVersionsService = createMock<OrganisationVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationVersionsController],
      providers: [
        {
          provide: OrganisationsService,
          useValue: organisationsService,
        },
        {
          provide: OrganisationVersionsService,
          useValue: organisationVersionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    controller = module.get<OrganisationVersionsController>(
      OrganisationVersionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('new', () => {
    it('fetches the organisation', async () => {
      const organisation = organisationFactory.build();
      organisationsService.find.mockResolvedValue(organisation);

      const result = await controller.new(organisation.id);

      expect(result).toEqual(organisation);

      expect(organisationsService.find).toHaveBeenCalledWith(organisation.id);
    });
  });

  describe('create', () => {
    it('creates a copy of the latest version of the organisation', async () => {
      const organisationVersion = organisationVersionFactory.build();
      const user = userFactory.build();

      const response = createMock<Response>();
      const request = createDefaultMockRequest();
      (getActingUser as jest.Mock).mockReturnValue(user);

      organisationVersionsService.findLatestForOrganisationId.mockResolvedValue(
        organisationVersion,
      );

      const newOrganisationVersion = organisationVersionFactory.build();
      organisationVersionsService.create.mockResolvedValue(
        newOrganisationVersion,
      );

      await controller.create(response, request, 'some-uuid');

      expect(organisationVersionsService.create).toHaveBeenCalledWith(
        organisationVersion,
        user,
      );

      expect(response.redirect).toHaveBeenCalledWith(
        `/admin/organisations/${newOrganisationVersion.organisation.id}/versions/${newOrganisationVersion.id}/edit`,
      );
    });
  });

  describe('show', () => {
    it('should return variables for the show template', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation: organisation,
      });
      const organisationWithVersion = Organisation.withVersion(
        organisation,
        version,
        true,
      );

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      const showTemplate: ShowTemplate = {
        organisation,
        presenter: {} as OrganisationPresenter,
        summaryList: {
          classes: 'govuk-summary-list--no-border',
          rows: [],
        },
        professions: [],
      };

      (
        OrganisationSummaryPresenter.prototype as DeepMocked<OrganisationSummaryPresenter>
      ).present.mockResolvedValue(showTemplate);

      expect(await controller.show('org-uuid', 'version-uuid')).toEqual(
        showTemplate,
      );

      expect(
        organisationVersionsService.findByIdWithOrganisation,
      ).toHaveBeenCalledWith('org-uuid', 'version-uuid');

      expect(OrganisationSummaryPresenter).toHaveBeenCalledWith(
        organisationWithVersion,
        i18nService,
      );
    });
  });

  describe('publish', () => {
    it('should publish the current version', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation: organisation,
      });
      const user = userFactory.build();

      const req = createDefaultMockRequest();
      (getActingUser as jest.Mock).mockReturnValue(user);

      const res = createMock<Response>({});

      const flashMock = flashMessage as jest.Mock;
      flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      const newVersion = organisationVersionFactory.build({
        organisation,
        user,
      });

      organisationVersionsService.create.mockResolvedValue(newVersion);

      await controller.publish(req, res, organisation.id, version.id);

      expect(
        organisationVersionsService.findByIdWithOrganisation,
      ).toHaveBeenCalledWith(organisation.id, version.id);

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

      expect(req.flash).toHaveBeenCalledWith('success', 'STUB_FLASH_MESSAGE');

      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/organisations/${organisation.id}/versions/${newVersion.id}`,
      );
    });
  });
});
