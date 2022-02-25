import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { flashMessage } from '../../common/flash-message';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import userFactory from '../../testutils/factories/user';
import { translationOf } from '../../testutils/translation-of';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { Organisation } from '../organisation.entity';
import { OrganisationArchiveController } from './organisation-archive.controller';

jest.mock('../../common/flash-message');
jest.mock('../../users/helpers/get-acting-user.helper');

describe('OrganisationArchiveController', () => {
  let controller: OrganisationArchiveController;

  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    organisationVersionsService = createMock<OrganisationVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationArchiveController],
      providers: [
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

    controller = module.get<OrganisationArchiveController>(
      OrganisationArchiveController,
    );
  });

  describe('new', () => {
    it('fetches the Organisation to render on the page', async () => {
      const organisation = organisationFactory.build();
      const version = organisationVersionFactory.build({
        organisation,
      });

      organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
        version,
      );

      const result = await controller.new(organisation.id, version.id);

      expect(
        organisationVersionsService.findByIdWithOrganisation,
      ).toHaveBeenCalledWith(organisation.id, version.id);
      expect(result).toEqual({
        organisation: Organisation.withVersion(organisation, version),
      });
    });
  });

});
