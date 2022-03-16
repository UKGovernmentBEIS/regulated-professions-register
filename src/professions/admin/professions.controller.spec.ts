import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { Organisation } from '../../organisations/organisation.entity';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { ProfessionsController as ProfessionsController } from './professions.controller';
import { ProfessionsPresenter } from './professions.presenter';
import industryFactory from '../../testutils/factories/industry';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { ProfessionVersionsService } from '../profession-versions.service';
import professionVersion from '../../testutils/factories/profession-version';
import userFactory from '../../testutils/factories/user';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { RegulationType } from '../profession-version.entity';

jest.mock('../../users/helpers/get-acting-user.helper');

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
  organisation: organisation1,
  industries: [industry1],
  regulationType: RegulationType.Accreditation,
  updated_at: new Date(2013, 4, 23),
});
const profession2 = professionFactory.build({
  name: 'Secondary School Teacher',
  occupationLocations: ['GB-NIR'],
  organisation: organisation1,
  industries: [industry1],
  regulationType: RegulationType.Licensing,
  updated_at: new Date(2011, 7, 27),
});
const profession3 = professionFactory.build({
  name: 'Trademark Attorny',
  occupationLocations: ['GB-SCT', 'GB-WLS'],
  organisation: organisation2,
  industries: [industry2, industry3],
  regulationType: RegulationType.Certification,
  updated_at: new Date(2021, 12, 1),
});

let request: DeepMocked<RequestWithAppSession>;
let i18nService: DeepMocked<I18nService>;

jest.mock('../../organisations/organisation.entity');

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;

  beforeEach(async () => {
    request = createDefaultMockRequest();

    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();
    organisationVersionsService = createMock<OrganisationVersionsService>();
    industriesService = createMock<IndustriesService>();
    i18nService = createMockI18nService();

    professionVersionsService.allWithLatestVersion.mockResolvedValue([
      profession1,
      profession2,
      profession3,
    ]);

    organisationVersionsService.allWithLatestVersion.mockResolvedValue(
      organisations,
    );

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
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        {
          provide: OrganisationVersionsService,
          useValue: organisationVersionsService,
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

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a blank Profession, create a blank ProfessionVersion and redirect', async () => {
      const blankProfession = professionFactory
        .justCreated('profession-id')
        .build();

      const user = userFactory.build();

      const versionFields = {
        alternateName: undefined,
        description: undefined,
        occupationLocations: undefined,
        regulationType: undefined,
        mandatoryRegistration: undefined,
        industries: undefined,
        qualifications: undefined,
        legislations: undefined,
        organisation: undefined,
        reservedActivities: undefined,
        profession: blankProfession,
        user: user,
      };

      const version = professionVersion
        .justCreated('version-id')
        .build(versionFields);

      professionsService.save.mockResolvedValue(blankProfession);
      professionVersionsService.save.mockResolvedValue(version);

      const res = createMock<Response>();
      (getActingUser as jest.Mock).mockReturnValue(user);

      await controller.create(res, request);

      expect(professionsService.save).toHaveBeenCalled();
      expect(professionVersionsService.save).toHaveBeenCalledWith(
        versionFields,
      );
      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/professions/profession-id/versions/version-id/top-level-information/edit`,
      );
    });
  });

  describe('index', () => {
    describe('when the user is a service owner', () => {
      beforeEach(() => {
        (getActingUser as jest.Mock).mockReturnValue(
          userFactory.build({ serviceOwner: true }),
        );
      });

      it('returns template params poulated to show an overview of professions', async () => {
        const result = await controller.index(request);

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [],
            organisations: [],
            industries: [],
            regulationTypes: [],
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
          regulationTypes: [],
        });

        const expected = await createPresenter(
          {
            keywords: 'MARK',
            nations: [],
            organisations: [],
            industries: [],
            regulationTypes: [],
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
          regulationTypes: [],
        });

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [Nation.find('GB-ENG')],
            organisations: [],
            industries: [],
            regulationTypes: [],
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
          regulationTypes: [],
        });

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [],
            organisations: [organisation2],
            industries: [],
            regulationTypes: [],
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
          regulationTypes: [],
        });

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [],
            organisations: [],
            industries: [industry2],
            regulationTypes: [],
          },
          null,
          [profession3],
        ).present('overview');

        expect(result).toEqual(expected);
      });

      it('returns filtered professions when searching by regulation type', async () => {
        const result = await controller.index(request, {
          keywords: '',
          nations: [],
          organisations: [],
          industries: [],
          regulationTypes: [RegulationType.Accreditation],
        });

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [],
            organisations: [],
            industries: [],
            regulationTypes: [RegulationType.Accreditation],
          },
          null,
          [profession1],
        ).present('overview');

        expect(result).toEqual(expected);
      });
    });

    describe('when the user is not a service owner', () => {
      beforeEach(() => {
        (getActingUser as jest.Mock).mockReturnValue(
          userFactory.build({
            serviceOwner: false,
            organisation: organisation1,
          }),
        );
      });

      it('returns template params poulated to show professions for a single organisation', async () => {
        const result = await controller.index(request);

        const expected = await createPresenter(
          {
            keywords: '',
            nations: [],
            organisations: [organisation1],
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
    i18nService,
  );
}
