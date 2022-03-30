import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { OrganisationVersionsController } from './organisation-versions.controller';

import { OrganisationVersionsService } from '../organisation-versions.service';

import { Organisation } from '../organisation.entity';
import { Profession } from '../../professions/profession.entity';

import { OrganisationSummaryPresenter } from '../presenters/organisation-summary.presenter';

import { ShowTemplate } from './interfaces/show-template.interface';

import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import userFactory from '../../testutils/factories/user';
import professionFactory from '../../testutils/factories/profession';

import { createMockI18nService } from '../../testutils/create-mock-i18n-service';

import { OrganisationPresenter } from '../presenters/organisation.presenter';

import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import { checkCanViewOrganisation } from '../../users/helpers/check-can-view-organisation';
import * as getProfessionsFromOrganisationModule from './../helpers/get-professions-from-organisation.helper';

jest.mock('../presenters/organisation-summary.presenter');
jest.mock('../presenters/organisation.presenter');
jest.mock('../../users/helpers/get-acting-user.helper');
jest.mock('../../users/helpers/check-can-view-organisation');
jest.mock('../presenters/organisation-summary.presenter');
jest.mock('../../professions/profession.entity');

describe('OrganisationVersionsController', () => {
  let controller: OrganisationVersionsController;

  let i18nService: I18nService;

  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;

  beforeEach(async () => {
    organisationVersionsService = createMock<OrganisationVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationVersionsController],
      providers: [
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

    it('should check the acting user has permission to update the Organisation', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation: organisation,
      });

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const response = createMock<Response>();

      organisationVersionsService.findLatestForOrganisationId.mockResolvedValue(
        version,
      );

      organisationVersionsService.hasLiveVersion.mockResolvedValue(true);

      await controller.create(response, request, 'some-uuid');

      expect(checkCanViewOrganisation).toHaveBeenCalledWith(
        request,
        organisation,
      );
    });
  });

  describe('show', () => {
    it('should return variables for the show template', async () => {
      const organisation = organisationFactory.build();
      const professions = professionFactory.buildList(5);

      const version = organisationVersionFactory.build({
        organisation: organisation,
      });
      const organisationWithVersion = Organisation.withVersion(
        organisation,
        version,
      );

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );
      organisationVersionsService.hasLiveVersion.mockResolvedValue(true);

      const getProfessionsFromOrganisationSpy = jest.spyOn(
        getProfessionsFromOrganisationModule,
        'getProfessionsFromOrganisation',
      );

      getProfessionsFromOrganisationSpy.mockReturnValue(professions);

      (Profession.withLatestLiveOrDraftVersion as jest.Mock).mockImplementation(
        (profession) => profession,
      );

      const showTemplate: ShowTemplate = {
        organisation,
        presenter: {} as OrganisationPresenter,
        hasLiveVersion: true,
        summaryList: {
          classes: 'govuk-summary-list--no-border',
          rows: [],
        },
        professions: [],
      };

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      (
        OrganisationSummaryPresenter.prototype as DeepMocked<OrganisationSummaryPresenter>
      ).present.mockResolvedValue(showTemplate);

      expect(
        await controller.show('org-uuid', 'version-uuid', request),
      ).toEqual(showTemplate);

      expect(
        organisationVersionsService.findByIdWithOrganisation,
      ).toHaveBeenCalledWith('org-uuid', 'version-uuid');
      expect(organisationVersionsService.hasLiveVersion).toHaveBeenCalledWith(
        organisationWithVersion,
      );

      expect(OrganisationSummaryPresenter).toHaveBeenCalledWith(
        organisationWithVersion,
        professions,
        i18nService,
      );
    });

    it('should check the acting user has permission to view the page', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation: organisation,
      });
      const organisationWithVersion = Organisation.withVersion(
        organisation,
        version,
      );

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );
      organisationVersionsService.hasLiveVersion.mockResolvedValue(true);

      await controller.show('org-uuid', 'version-uuid', request);

      expect(checkCanViewOrganisation).toHaveBeenCalledWith(
        request,
        organisationWithVersion,
      );
    });
  });
});
