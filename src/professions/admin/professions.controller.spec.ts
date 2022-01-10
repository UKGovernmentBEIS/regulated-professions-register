import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createMockRequest } from '../../testutils/create-mock-request';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { Organisation } from '../../organisations/organisation.entity';
import { OrganisationsService } from '../../organisations/organisations.service';
import { User, UserRole } from '../../users/user.entity';
import { FilterInput } from '../interfaces/filter-input.interface';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { ProfessionsController as ProfessionsController } from './professions.controller';
import { ProfessionsPresenter } from './professions.presenter';
import industryFactory from '../../testutils/factories/industry';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';

const referrer = 'http://example.com/some/path';
const host = 'example.com';

const industry1 = industryFactory.build({
  id: 'example-industry-1',
  name: 'industries.example1',
});
const industry2 = industryFactory.build({
  id: 'example-industry-2',
  name: 'industries.example2',
});
const industry3 = industryFactory.build({
  id: 'example-industry-3',
  name: 'industries.example3',
});

const industries = [industry1, industry2, industry3];

const organisation1 = organisationFactory.build({
  id: 'example-organisation-1',
  name: 'Example Organisation 1',
});
const organisation2 = organisationFactory.build({
  id: 'example-organisation-2',
  name: 'Example Organisation 2',
});

const organisations = [organisation1, organisation2];

const profession1 = professionFactory.build({
  name: 'Primary School Teacher',
  occupationLocations: ['GB-ENG'],
  industries: [industry1],
  organisation: organisation1,
  updated_at: new Date(2013, 4, 23),
});
const profession2 = professionFactory.build({
  name: 'Secondary School Teacher',
  occupationLocations: ['GB-NIR'],
  industries: [industry1],
  organisation: organisation1,
  updated_at: new Date(2011, 7, 27),
});
const profession3 = professionFactory.build({
  name: 'Trademark Attorny',
  occupationLocations: ['GB-SCT', 'GB-WLS'],
  industries: [industry2, industry3],
  organisation: organisation2,
  updated_at: new Date(2021, 12, 1),
});

let request: DeepMocked<Request>;
let i18nService: DeepMocked<I18nService>;

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  let professionsService: DeepMocked<ProfessionsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let organisationsService: DeepMocked<OrganisationsService>;

  beforeEach(async () => {
    request = createMockRequest(referrer, host);

    professionsService = createMock<ProfessionsService>();
    organisationsService = createMock<OrganisationsService>();
    industriesService = createMock<IndustriesService>();
    i18nService = createMockI18nService();

    professionsService.allConfirmed.mockImplementation(async () => {
      return [profession1, profession2, profession3];
    });

    organisationsService.all.mockImplementation(async () => {
      return organisations;
    });

    industriesService.all.mockImplementation(async () => {
      return industries;
    });

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: ProfessionsService,
          useValue: professionsService,
        },
        {
          provide: OrganisationsService,
          useValue: organisationsService,
        },
        {
          provide: IndustriesService,
          useValue: industriesService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
      controllers: [ProfessionsController],
    }).compile();

    controller = module.get<ProfessionsController>(ProfessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    describe('when the user is an admin', () => {
      beforeEach(() => {
        request['appSession'].user = createMock<User>({
          roles: [UserRole.Admin],
        });
      });

      it('returns template params poulated to show an overview of professions', async () => {
        const result = await controller.index(request);

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [],
            organisations: [],
            industries: [],
            changedBy: [],
          },
          null,
          [profession1, profession2, profession3],
        ).present('overview');

        expect(result).toEqual(expected);
      });

      it('returns filtered professions when searching by keyword', async () => {
        const result = await controller.index(request, {
          keywords: 'MARK',
          nations: [],
          organisations: [],
          industries: [],
        });

        const expected = await createPresenter(
          {
            keywords: 'MARK',
            nations: [],
            organisations: [],
          },
          null,
          [profession3],
        ).present('overview');

        expect(result).toEqual(expected);
      });

      it('returns filtered professions when searching by nation', async () => {
        const result = await controller.index(request, {
          keywords: '',
          nations: ['GB-ENG'],
          organisations: [],
          industries: [],
        });

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [Nation.find('GB-ENG')],
            organisations: [],
            industries: [],
          },
          null,
          [profession1],
        ).present('overview');

        expect(result).toEqual(expected);
      });

      it('returns filtered professions when searching by organisation', async () => {
        const result = await controller.index(request, {
          keywords: '',
          nations: [],
          organisations: ['example-organisation-2'],
          industries: [],
        });

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [],
            organisations: [organisation2],
            industries: [],
          },
          null,
          [profession3],
        ).present('overview');

        expect(result).toEqual(expected);
      });

      it('returns filtered professions when searching by industry', async () => {
        const result = await controller.index(request, {
          keywords: '',
          nations: [],
          organisations: [],
          industries: ['example-industry-2'],
        });

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [],
            organisations: [],
            industries: [industry2],
          },
          null,
          [profession3],
        ).present('overview');

        expect(result).toEqual(expected);
      });
    });

    describe('when the user is not an admin', () => {
      beforeEach(() => {
        request['appSession'].user = createMock<User>({
          roles: [UserRole.Editor],
        });
      });

      it('returns template params poulated to show professions for a single organisation', async () => {
        const result = await controller.index(request);

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [],
            organisations: [organisation1],
            industries: [],
            changedBy: [],
          },
          organisation1,
          [profession1, profession2],
        ).present('single-organisation');

        expect(result).toEqual(expected);
      });

      it('returns filtered professions when searching by keyword', async () => {
        const result = await controller.index(request, {
          keywords: 'primary',
          nations: [],
          changedBy: [],
        });

        const expected = await createPresenter(
          {
            keywords: 'primary',
            nations: [],
            organisations: [organisation1],
            changedBy: [],
          },
          organisation1,
          [profession1],
        ).present('single-organisation');

        expect(result).toEqual(expected);
      });

      it('returns filtered professions when searching by nation', async () => {
        const result = await controller.index(request, {
          keywords: '',
          nations: ['GB-NIR'],
          changedBy: [],
        });

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [Nation.find('GB-NIR')],
            organisations: [organisation1],
            changedBy: [],
          },
          organisation1,
          [profession2],
        ).present('single-organisation');

        expect(result).toEqual(expected);
      });
    });
  });
});

function createPresenter(
  filterInput: FilterInput,
  userOrganisation: Organisation | null,
  professions: Profession[],
): ProfessionsPresenter {
  return new ProfessionsPresenter(
    filterInput,
    userOrganisation,
    Nation.all(),
    organisations,
    industries,
    professions,
    request,
    i18nService,
  );
}
