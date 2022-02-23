import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { Organisation } from '../organisation.entity';
import { OrganisationPublicationController } from './organisation-publication.controller';

describe('OrganisationPublicationController', () => {
  let controller: OrganisationPublicationController;

  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    organisationVersionsService = createMock<OrganisationVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationPublicationController],
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
