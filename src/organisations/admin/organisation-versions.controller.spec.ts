import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { OrganisationVersionsController } from './organisation-versions.controller';

import { OrganisationVersionsService } from '../organisation-versions.service';
import { OrganisationsService } from '../organisations.service';

import organisationFactory from '../../testutils/factories/organisation';

describe('OrganisationVersionsController', () => {
  let controller: OrganisationVersionsController;

  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;

  beforeEach(async () => {
    organisationsService = createMock<OrganisationsService>();
    organisationVersionsService = createMock<OrganisationVersionsService>();

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
});
