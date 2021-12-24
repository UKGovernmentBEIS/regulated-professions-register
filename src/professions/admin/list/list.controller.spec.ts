import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../../common/create-mock-i18n-service';
import { createMockRequest } from '../../../common/create-mock-request';
import { IndustriesService } from '../../../industries/industries.service';
import { Industry } from '../../../industries/industry.entity';
import { Nation } from '../../../nations/nation';
import { Organisation } from '../../../organisations/organisation.entity';
import { OrganisationsService } from '../../../organisations/organisations.service';
import { User, UserRole } from '../../../users/user.entity';
import { FilterInput } from '../../interfaces/filter-input.interface';
import { Profession } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { ListController } from './list.controller';
import { ListPresenter } from './list.presenter';

const referrer = 'http://example.com/some/path';
const host = 'example.com';

const industry1 = new Industry('industries.example1');
industry1.id = 'example-industry-1';

const industry2 = new Industry('industries.example2');
industry2.id = 'example-industry-2';

const industry3 = new Industry('industries.example3');
industry3.id = 'example-industry-3';

const industries = [industry1, industry2, industry3];

const organisation1 = new Organisation('Example Organisation 1');
organisation1.id = 'example-organisation-1';

const organisation2 = new Organisation('Example Organisation 2');
organisation2.id = 'example-organisation-2';

const organisations = [organisation1, organisation2];

const profession1 = new Profession('Primary School Teacher');
profession1.occupationLocations = ['GB-ENG'];
profession1.industries = [industry1];
profession1.organisation = organisation1;
profession1.updated_at = new Date(2013, 4, 23);

const profession2 = new Profession('Secondary School Teacher');
profession2.occupationLocations = ['GB-NIR'];
profession2.industries = [industry1];
profession2.organisation = organisation1;
profession2.updated_at = new Date(2011, 7, 27);

const profession3 = new Profession('Trademark Attorny');
profession3.occupationLocations = ['GB-SCT', 'GB-WLS'];
profession3.industries = [industry2, industry3];
profession3.organisation = organisation2;
profession3.updated_at = new Date(2021, 12, 1);

let request: DeepMocked<Request>;
let i18nService: DeepMocked<I18nService>;

describe('ListController', () => {
  let controller: ListController;
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
      controllers: [ListController],
    }).compile();

    controller = module.get<ListController>(ListController);
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

        const expected = await createListPresenter(
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
    });

    describe('when the user is not an admin', () => {
      beforeEach(() => {
        request['appSession'].user = createMock<User>({
          roles: [UserRole.Editor],
        });
      });

      it('returns template params poulated to show professions for a single organisation', async () => {
        const result = await controller.index(request);

        const expected = await createListPresenter(
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
    });
  });

  describe('create', () => {
    describe('when the user is an admin', () => {
      beforeEach(() => {
        request['appSession'].user = createMock<User>({
          roles: [UserRole.Admin],
        });
      });

      it('returns filtered professions when searching by keyword', async () => {
        const result = await controller.create(
          {
            keywords: 'MARK',
            nations: [],
            organisations: [],
            industries: [],
          },
          request,
        );

        const expected = await createListPresenter(
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
        const result = await controller.create(
          {
            keywords: '',
            nations: ['GB-ENG'],
            organisations: [],
            industries: [],
          },
          request,
        );

        const expected = await createListPresenter(
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
        const result = await controller.create(
          {
            keywords: '',
            nations: [],
            organisations: ['example-organisation-2'],
            industries: [],
          },
          request,
        );

        const expected = await createListPresenter(
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
        const result = await controller.create(
          {
            keywords: '',
            nations: [],
            organisations: [],
            industries: ['example-industry-2'],
          },
          request,
        );

        const expected = await createListPresenter(
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

      it('returns filtered professions when searching by keyword', async () => {
        const result = await controller.create(
          {
            keywords: 'primary',
            nations: [],
            changedBy: [],
          },
          request,
        );

        const expected = await createListPresenter(
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
        const result = await controller.create(
          {
            keywords: '',
            nations: ['GB-NIR'],
            changedBy: [],
          },
          request,
        );

        const expected = await createListPresenter(
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

function createListPresenter(
  filterInput: FilterInput,
  userOrganisation: Organisation | null,
  professions: Profession[],
): ListPresenter {
  return new ListPresenter(
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
