import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { IndustriesService } from '../../industries/industries.service';
import { Nation } from '../../nations/nation';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { ProfessionsController as ProfessionsController } from './professions.controller';
import { ProfessionsPresenter } from './presenters/professions.presenter';
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
import * as removeFromQueryStringModule from '../../helpers/remove-from-query-string.helper';
import * as getQueryStringModule from '../../helpers/get-query-string.helper';
import { IndexTemplate } from './interfaces/index-template.interface';
import { User } from '../../users/user.entity';

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

const profession1 = professionFactory.build(
  {
    name: 'Primary School Teacher',
    occupationLocations: ['GB-ENG'],
    industries: [industry1],
    regulationType: RegulationType.Accreditation,
    updated_at: new Date(2013, 4, 23),
  },
  { transient: { organisations: [organisation1] } },
);
const profession2 = professionFactory.build(
  {
    name: 'Secondary School Teacher',
    occupationLocations: ['GB-NIR'],
    industries: [industry1],
    regulationType: RegulationType.Licensing,
    updated_at: new Date(2011, 7, 27),
  },
  { transient: { organisations: [organisation1] } },
);
const profession3 = professionFactory.build(
  {
    name: 'Trademark Attorny',
    occupationLocations: ['GB-SCT', 'GB-WLS'],
    industries: [industry2, industry3],
    regulationType: RegulationType.Certification,
    updated_at: new Date(2021, 12, 1),
  },
  { transient: { organisations: [organisation2] } },
);

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

    professionVersionsService.allWithLatestVersionForOrganisation.mockResolvedValue(
      [profession1, profession2],
    );

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
      let user: User;

      beforeEach(() => {
        user = userFactory.build({ serviceOwner: true });
        (getActingUser as jest.Mock).mockReturnValue(user);
      });

      it('returns template params poulated to show an overview of professions', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request);

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: '',
              nations: [],
              organisations: [],
              industries: [],
              regulationTypes: [],
            },
            user,
            [profession1, profession2, profession3],
          ).present('overview'),
          sortMethod: 'name',
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersion,
        ).toHaveBeenCalledWith('name');
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).not.toHaveBeenCalled();
      });

      it('returns sorted professions when sorting by last updated', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request, {
          keywords: '',
          nations: [],
          organisations: [],
          industries: [],
          regulationTypes: [],
          sortBy: 'last-updated',
        });

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: '',
              nations: [],
              organisations: [],
              industries: [],
              regulationTypes: [],
            },
            user,
            [profession1, profession2, profession3],
          ).present('overview'),
          sortMethod: 'last-updated',
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersion,
        ).toHaveBeenCalledWith('last-updated');
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).not.toHaveBeenCalled();
      });

      it('returns sorted professions when sorting by status', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request, {
          keywords: '',
          nations: [],
          organisations: [],
          industries: [],
          regulationTypes: [],
          sortBy: 'status',
        });

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: '',
              nations: [],
              organisations: [],
              industries: [],
              regulationTypes: [],
            },
            user,
            [profession1, profession2, profession3],
          ).present('overview'),
          sortMethod: 'status',
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersion,
        ).toHaveBeenCalledWith('status');
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).not.toHaveBeenCalled();
      });

      it('returns filtered professions when searching by keyword', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request, {
          keywords: 'MARK',
          nations: [],
          organisations: [],
          industries: [],
          regulationTypes: [],
        });

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: 'MARK',
              nations: [],
              organisations: [],
              industries: [],
              regulationTypes: [],
            },
            user,
            [profession3],
          ).present('overview'),
          sortMethod: 'name',
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersion,
        ).toHaveBeenCalledWith('name');
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).not.toHaveBeenCalled();
      });

      it('returns filtered professions when searching by nation', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request, {
          keywords: '',
          nations: ['GB-ENG'],
          organisations: [],
          industries: [],
          regulationTypes: [],
        });

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: '',
              nations: [Nation.find('GB-ENG')],
              organisations: [],
              industries: [],
              regulationTypes: [],
            },
            user,
            [profession1],
          ).present('overview'),
          sortMethod: 'name',
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersion,
        ).toHaveBeenCalledWith('name');
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).not.toHaveBeenCalled();
      });

      it('returns filtered professions when searching by organisation', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request, {
          keywords: '',
          nations: [],
          organisations: ['example-organisation-2'],
          industries: [],
          regulationTypes: [],
        });

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: '',
              nations: [],
              organisations: [organisation2],
              industries: [],
              regulationTypes: [],
            },
            user,
            [profession3],
          ).present('overview'),
          sortMethod: 'name',
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersion,
        ).toHaveBeenCalledWith('name');
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).not.toHaveBeenCalled();
      });

      it('returns filtered professions when searching by industry', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request, {
          keywords: '',
          nations: [],
          organisations: [],
          industries: ['example-industry-2'],
          regulationTypes: [],
        });

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: '',
              nations: [],
              organisations: [],
              industries: [industry2],
              regulationTypes: [],
            },
            user,
            [profession3],
          ).present('overview'),
          sortMethod: 'name',
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersion,
        ).toHaveBeenCalledWith('name');
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).not.toHaveBeenCalled();
      });

      it('returns filtered professions when searching by regulation type', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request, {
          keywords: '',
          nations: [],
          organisations: [],
          industries: [],
          regulationTypes: [RegulationType.Accreditation],
        });

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: '',
              nations: [],
              organisations: [],
              industries: [],
              regulationTypes: [RegulationType.Accreditation],
            },
            user,
            [profession1],
          ).present('overview'),
          sortMethod: 'name',
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersion,
        ).toHaveBeenCalledWith('name');
        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).not.toHaveBeenCalled();
      });
    });

    describe('when the user is not a service owner', () => {
      let user: User;

      beforeEach(() => {
        user = userFactory.build({
          serviceOwner: false,
          organisation: organisation1,
        });
        (getActingUser as jest.Mock).mockReturnValue(user);
      });

      it('returns template params poulated to show professions for a single organisation', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request);

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: '',
              nations: [],
              organisations: [],
            },
            user,
            [profession1, profession2],
          ).present('single-organisation'),
          sortMethod: null,
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).toHaveBeenCalledWith(organisation1);
        expect(
          professionVersionsService.allWithLatestVersion,
        ).not.toHaveBeenCalled();
      });

      it('returns filtered professions when searching by keyword', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request, {
          keywords: 'primary',
          nations: [],
        });

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: 'primary',
              nations: [],
              organisations: [],
            },
            user,
            [profession1],
          ).present('single-organisation'),
          sortMethod: null,
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).toHaveBeenCalledWith(organisation1);
        expect(
          professionVersionsService.allWithLatestVersion,
        ).not.toHaveBeenCalled();
      });

      it('returns filtered professions when searching by nation', async () => {
        jest
          .spyOn(getQueryStringModule, 'getQueryString')
          .mockReturnValue('mock-query-string');
        jest
          .spyOn(removeFromQueryStringModule, 'removeFromQueryString')
          .mockReturnValue('mock-query-string-with-removal');

        const result = await controller.index(request, {
          keywords: '',
          nations: ['GB-NIR'],
        });

        const expected: IndexTemplate = {
          ...createPresenter(
            {
              keywords: '',
              nations: [Nation.find('GB-NIR')],
              organisations: [],
            },
            user,
            [profession2],
          ).present('single-organisation'),
          sortMethod: null,
          filterQuery: 'mock-query-string-with-removal',
        };

        expect(result).toEqual(expected);

        expect(
          professionVersionsService.allWithLatestVersionForOrganisation,
        ).toHaveBeenCalledWith(organisation1);
        expect(
          professionVersionsService.allWithLatestVersion,
        ).not.toHaveBeenCalled();
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});

function createPresenter(
  filterInput: FilterInput,
  user: User,
  professions: Profession[],
): ProfessionsPresenter {
  return new ProfessionsPresenter(
    filterInput,
    user,
    Nation.all(),
    organisations,
    industries,
    professions,
    i18nService,
  );
}
