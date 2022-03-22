import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { I18nService } from 'nestjs-i18n';
import { Response } from 'express';

import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from '../organisations.service';
import { OrganisationVersionsService } from '../organisation-versions.service';
import { Organisation } from '../organisation.entity';
import { OrganisationVersion } from '../organisation-version.entity';

import { OrganisationsPresenter } from './presenters/organisations.presenter';
import { OrganisationPresenter } from '../presenters/organisation.presenter';
import { OrganisationDto } from './dto/organisation.dto';

import organisationFactory from '../../testutils/factories/organisation';
import organisationVersionFactory from '../../testutils/factories/organisation-version';
import professionFactory from '../../testutils/factories/profession';
import industryFactory from '../../testutils/factories/industry';
import userFactory from '../../testutils/factories/user';

import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { SummaryList } from '../../common/interfaces/summary-list';
import { IndustriesService } from '../../industries/industries.service';
import { IndexTemplate } from './interfaces/index-template.interface';
import { OrganisationsFilterHelper } from '../helpers/organisations-filter.helper';
import { FilterDto } from './dto/filter.dto';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { flashMessage } from '../../common/flash-message';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { escape } from '../../helpers/escape.helper';
import { translationOf } from '../../testutils/translation-of';
import { Nation } from '../../nations/nation';
import { RegulationType } from '../../professions/profession-version.entity';
import { checkCanViewOrganisation } from '../../users/helpers/check-can-view-organisation';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';

jest.mock('./presenters/organisations.presenter');
jest.mock('../presenters/organisation.presenter');
jest.mock('../helpers/organisations-filter.helper');
jest.mock('../../common/flash-message');
jest.mock('../../users/helpers/get-acting-user.helper');
jest.mock('../../helpers/escape.helper');
jest.mock('../../users/helpers/check-can-view-organisation');

describe('OrganisationsController', () => {
  let controller: OrganisationsController;

  let i18nService: I18nService;

  let organisationsService: DeepMocked<OrganisationsService>;
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let industriesService: DeepMocked<IndustriesService>;

  beforeEach(async () => {
    i18nService = createMockI18nService();

    organisationsService = createMock<OrganisationsService>();
    industriesService = createMock<IndustriesService>();
    organisationVersionsService = createMock<OrganisationVersionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationsController],
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
          provide: IndustriesService,
          useValue: industriesService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    controller = module.get<OrganisationsController>(OrganisationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    describe('when the user is a service owner', () => {
      describe('when no filter is provided', () => {
        it('should return template params for all organisations', async () => {
          const request = createDefaultMockRequest();
          (getActingUser as jest.Mock).mockReturnValue(
            userFactory.build({ serviceOwner: true }),
          );

          const templateParams: IndexTemplate = {
            view: 'overview',
            userOrganisation: translationOf('app.beis'),
            organisationsTable: {
              firstCellIsHeader: true,
              head: [{ text: 'Headers' }],
              rows: [
                [{ text: 'Row 1' }],
                [{ text: 'Row 2' }],
                [{ text: 'Row 3' }],
              ],
            },
            filters: {
              keywords: '',
              nations: [],
              industries: [],
              regulationTypes: [],
            },
            nationsCheckboxItems: [],
            industriesCheckboxItems: [],
            regulationTypesCheckboxItems: [],
          };

          const organisations = createOrganisations();
          const nations = Nation.all();
          const industries = industryFactory.buildList(5);

          (
            OrganisationsPresenter.prototype as DeepMocked<OrganisationsPresenter>
          ).present.mockResolvedValue(templateParams);

          (
            OrganisationsFilterHelper.prototype as DeepMocked<OrganisationsFilterHelper>
          ).filter.mockReturnValue(organisations);

          expect(await controller.index(request)).toEqual(templateParams);

          expect(
            organisationVersionsService.searchWithLatestVersion,
          ).toHaveBeenCalledWith({
            keywords: '',
            nations: [],
            industries: [],
            regulationTypes: [],
          } as FilterInput);

          expect(OrganisationsPresenter).toHaveBeenCalledWith(
            translationOf('app.beis'),
            nations,
            industries,
            {
              keywords: '',
              nations: [],
              industries: [],
              regulationTypes: [],
            },
            organisations,
            i18nService,
          );
          expect(OrganisationsPresenter.prototype.present).toBeCalledWith(
            'overview',
          );
        });
      });

      describe('when a filter is provided', () => {
        it('should return template params for filtered organisations', async () => {
          const request = createDefaultMockRequest();
          (getActingUser as jest.Mock).mockReturnValue(
            userFactory.build({ serviceOwner: true }),
          );

          const templateParams: IndexTemplate = {
            view: 'overview',
            userOrganisation: translationOf('app.beis'),
            organisationsTable: {
              firstCellIsHeader: true,
              head: [{ text: 'Headers' }],
              rows: [
                [{ text: 'Row 1' }],
                [{ text: 'Row 2' }],
                [{ text: 'Row 3' }],
              ],
            },
            filters: {
              keywords: '',
              nations: [],
              industries: [],
              regulationTypes: [],
            },
            nationsCheckboxItems: [],
            industriesCheckboxItems: [],
            regulationTypesCheckboxItems: [],
          };

          const organisations = createOrganisations();
          const nations = Nation.all();
          const industries = industryFactory.buildList(5);

          (
            OrganisationsPresenter.prototype as DeepMocked<OrganisationsPresenter>
          ).present.mockResolvedValue(templateParams);

          (
            OrganisationsFilterHelper.prototype as DeepMocked<OrganisationsFilterHelper>
          ).filter.mockReturnValue([organisations[1], organisations[3]]);

          expect(
            await controller.index(request, {
              keywords: 'example keywords',
              nations: [nations[2].code],
              industries: [industries[1].id],
              regulationTypes: [RegulationType.Accreditation],
            } as FilterDto),
          ).toEqual(templateParams);

          expect(
            organisationVersionsService.searchWithLatestVersion,
          ).toHaveBeenCalledWith({
            keywords: 'example keywords',
            nations: [nations[2]],
            industries: [industries[1]],
            regulationTypes: [RegulationType.Accreditation],
          } as FilterInput);

          expect(OrganisationsPresenter).toHaveBeenCalledWith(
            translationOf('app.beis'),
            nations,
            industries,
            {
              keywords: 'example keywords',
              nations: [nations[2]],
              industries: [industries[1]],
              regulationTypes: [RegulationType.Accreditation],
            },
            [organisations[1], organisations[3]],
            i18nService,
          );
          expect(OrganisationsPresenter.prototype.present).toBeCalledWith(
            'overview',
          );
        });
      });
    });

    describe('when the user is not a service owner', () => {
      it("should return template params for the user's organisation", async () => {
        const organisations = createOrganisations();
        const userOrganisation = organisations[0];

        const templateParams: IndexTemplate = {
          view: 'single-organisation',
          userOrganisation: userOrganisation.name,
          organisationsTable: {
            firstCellIsHeader: true,
            head: [{ text: 'Headers' }],
            rows: [
              [{ text: 'Row 1' }],
              [{ text: 'Row 2' }],
              [{ text: 'Row 3' }],
            ],
          },
          filters: {
            keywords: '',
            nations: [],
            industries: [],
            regulationTypes: [],
          },
          nationsCheckboxItems: [],
          industriesCheckboxItems: [],
          regulationTypesCheckboxItems: [],
        };

        const nations = Nation.all();
        const industries = industryFactory.buildList(5);

        const request = createDefaultMockRequest();
        (getActingUser as jest.Mock).mockReturnValue(
          userFactory.build({
            serviceOwner: false,
            organisation: userOrganisation,
          }),
        );

        (
          OrganisationsPresenter.prototype as DeepMocked<OrganisationsPresenter>
        ).present.mockResolvedValue(templateParams);

        (
          OrganisationsFilterHelper.prototype as DeepMocked<OrganisationsFilterHelper>
        ).filter.mockReturnValue([userOrganisation]);

        expect(await controller.index(request)).toEqual(templateParams);

        expect(
          organisationVersionsService.searchWithLatestVersion,
        ).toHaveBeenCalledWith({
          keywords: '',
          nations: [],
          organisations: [userOrganisation],
          industries: [],
          regulationTypes: [],
        } as FilterInput);

        expect(OrganisationsPresenter).toHaveBeenCalledWith(
          userOrganisation.name,
          nations,
          industries,
          {
            keywords: '',
            nations: [],
            organisations: [userOrganisation],
            industries: [],
            regulationTypes: [],
          },
          [userOrganisation],
          i18nService,
        );
        expect(OrganisationsPresenter.prototype.present).toBeCalledWith(
          'single-organisation',
        );
      });
    });
  });

  describe('create', () => {
    it('should create a blank organisation and version and redirect to edit', async () => {
      const user = userFactory.build();
      const organisation = organisationFactory.build({
        id: 'some-uuid',
      });
      const organisationVersion = organisationVersionFactory.build({
        id: 'some-other-uuid',
        organisation: organisation,
      });

      const response = createMock<Response>();
      const request = createDefaultMockRequest();
      (getActingUser as jest.Mock).mockReturnValue(user);

      organisationsService.save.mockResolvedValue(organisation);
      organisationVersionsService.save.mockResolvedValue(organisationVersion);

      await controller.create(response, request);

      expect(organisationsService.save).toHaveBeenCalledWith(
        expect.objectContaining(new Organisation()),
      );
      expect(organisationVersionsService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          organisation: organisation,
          user: user,
        } as OrganisationVersion),
      );
      expect(response.redirect).toHaveBeenCalledWith(
        `/admin/organisations/some-uuid/versions/some-other-uuid/edit`,
      );
    });
  });

  describe('edit', () => {
    it('should return the organisation', async () => {
      const organisation = createOrganisation();

      organisationsService.findWithVersion.mockResolvedValue(organisation);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      expect(
        await controller.edit(organisation.id, 'version-uuid', request),
      ).toEqual(organisation);

      expect(organisationsService.findWithVersion).toHaveBeenCalledWith(
        organisation.id,
        'version-uuid',
      );
    });

    it('should check the acting user has permissions to edit the organisation', async () => {
      const organisation = createOrganisation();

      organisationsService.findWithVersion.mockResolvedValue(organisation);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.edit(organisation.id, 'version-uuid', request);

      expect(checkCanViewOrganisation).toHaveBeenCalledWith(
        request,
        organisation,
      );
    });
  });

  describe('update', () => {
    describe('when confirm is not set', () => {
      describe('when the organisation does not have a slug', () => {
        it('saves the organisation and the name', async () => {
          const summaryList: SummaryList = {
            classes: 'govuk-summary-list--no-border',
            rows: [],
          };

          (
            OrganisationPresenter.prototype as DeepMocked<OrganisationPresenter>
          ).summaryList.mockResolvedValue(summaryList);

          const organisationId = 'some-uuid';
          const versionId = 'some-other-uuid';
          const response = createMock<Response>();
          const request = createDefaultMockRequest({
            user: userFactory.build(),
          });

          const organisationDto: OrganisationDto = {
            name: 'Organisation',
            alternateName: '',
            email: 'email@example.com',
            url: 'http://example.com',
            address: '123 Fake Street',
            telephone: '122356',
            fax: '',
          };

          const organisation = organisationFactory.build({ slug: '' });
          const version = organisationVersionFactory.build({
            organisation: organisation,
          });

          organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
            version,
          );

          const newOrganisation = {
            ...organisation,
            name: 'Organisation',
          };

          const newVersion = {
            ...version,
            ...OrganisationVersion.fromDto(organisationDto),
          };

          organisationsService.save.mockResolvedValue(newOrganisation);
          organisationVersionsService.save.mockResolvedValue(newVersion);

          await controller.update(
            organisationId,
            versionId,
            organisationDto,
            response,
            request,
          );

          expect(organisationsService.save).toHaveBeenCalledWith(
            newOrganisation,
          );

          expect(organisationVersionsService.save).toHaveBeenCalledWith(
            newVersion,
          );

          const updatedOrganisation = Organisation.withVersion(
            newOrganisation,
            newVersion,
            true,
          );

          expect(OrganisationPresenter).toHaveBeenCalledWith(
            updatedOrganisation,
            i18nService,
          );

          expect(
            OrganisationPresenter.prototype.summaryList,
          ).toHaveBeenCalledWith({
            classes: 'govuk-summary-list',
            removeBlank: false,
            includeName: true,
            includeActions: true,
          });

          expect(response.render).toHaveBeenCalledWith(
            'admin/organisations/review',
            {
              ...updatedOrganisation,
              summaryList: summaryList,
              backLink: `/admin/organisations/${organisation.id}/versions/${version.id}/edit/`,
            },
          );
        });
      });

      describe('when the organisation already has a slug', () => {
        it('Does not re set the name', async () => {
          const organisationDto: OrganisationDto = {
            name: 'Organisation',
            alternateName: '',
            email: 'email@example.com',
            url: 'http://example.com',
            address: '123 Fake Street',
            telephone: '122356',
            fax: '',
          };

          const organisation = organisationFactory.build({
            name: 'My awesome organisation',
            slug: 'my-awesome-organisation',
          });
          const version = organisationVersionFactory.build({
            organisation: organisation,
          });
          const response = createMock<Response>();
          const request = createDefaultMockRequest({
            user: userFactory.build(),
          });

          organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
            version,
          );

          const newVersion = {
            ...version,
            ...OrganisationVersion.fromDto(organisationDto),
          };

          organisationVersionsService.save.mockResolvedValue(newVersion);

          await controller.update(
            organisation.id,
            version.id,
            organisationDto,
            response,
            request,
          );

          expect(organisationsService.save).not.toHaveBeenCalled();
          expect(organisationVersionsService.save).toHaveBeenCalledWith(
            newVersion,
          );
        });
      });
    });

    describe('when confirm is set', () => {
      let organisation: Organisation;
      let version: OrganisationVersion;
      let response: DeepMocked<Response>;
      let request: DeepMocked<RequestWithAppSession>;
      let organisationDto: DeepMocked<OrganisationDto>;
      let flashMock: jest.Mock;

      describe('when the slug is not set', () => {
        beforeEach(async () => {
          organisation = organisationFactory.build({ slug: '' });
          version = organisationVersionFactory.build({
            organisation: organisation,
          });
          response = createMock<Response>();
          request = createDefaultMockRequest({
            user: userFactory.build(),
          });

          organisationDto = createMock<OrganisationDto>({
            confirm: true,
          });

          organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
            version,
          );

          flashMock = flashMessage as jest.Mock;
          flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

          await controller.update(
            'some-uuid',
            'some-other-uuid',
            organisationDto,
            response,
            request,
          );
        });

        it('should set the slug and confirm the version', async () => {
          expect(
            organisationVersionsService.findByIdWithOrganisation,
          ).toHaveBeenCalledWith('some-uuid', 'some-other-uuid');

          expect(organisationsService.setSlug).toHaveBeenCalledWith(
            organisation,
          );
          expect(organisationVersionsService.confirm).toHaveBeenCalledWith({
            ...version,
            organisation: organisation,
          });
        });

        it('should set a flash message and redirect', () => {
          expect(flashMock).toHaveBeenCalledWith(
            'Translation of `organisations.admin.create.confirmation.heading`',
            'Translation of `organisations.admin.create.confirmation.body`',
          );

          expect(escape).toHaveBeenCalledWith(organisation.name);

          expect(request.flash).toHaveBeenCalledWith(
            'info',
            'STUB_FLASH_MESSAGE',
          );

          expect(response.redirect).toHaveBeenCalledWith(
            `/admin/organisations/${organisation.id}/versions/${version.id}`,
          );
        });
      });

      describe('when the slug is set', () => {
        beforeEach(async () => {
          organisation = organisationFactory.build({ slug: 'some-slug' });
          version = organisationVersionFactory.build({
            organisation: organisation,
          });
          response = createMock<Response>();
          request = createDefaultMockRequest({
            user: userFactory.build(),
          });

          organisationDto = createMock<OrganisationDto>({
            confirm: true,
          });

          organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
            version,
          );

          (escape as jest.Mock).mockImplementation();

          flashMock = flashMessage as jest.Mock;
          flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

          await controller.update(
            'some-uuid',
            'some-other-uuid',
            organisationDto,
            response,
            request,
          );
        });

        it('should save the version and not set the slug again', async () => {
          expect(organisationsService.setSlug).not.toHaveBeenCalledWith(
            organisation,
          );
          expect(organisationVersionsService.confirm).toHaveBeenCalledWith({
            ...version,
            organisation: organisation,
          });
        });

        it('should set a flash message and redirect', () => {
          expect(flashMock).toHaveBeenCalledWith(
            'Translation of `organisations.admin.edit.confirmation.heading`',
            'Translation of `organisations.admin.edit.confirmation.body`',
          );

          expect(escape).toHaveBeenCalledWith(organisation.name);

          expect(request.flash).toHaveBeenCalledWith(
            'info',
            'STUB_FLASH_MESSAGE',
          );

          expect(response.redirect).toHaveBeenCalledWith(
            `/admin/organisations/${organisation.id}/versions/${version.id}`,
          );
        });
      });
    });
  });

  it('should check the acting user has permissions to edit the organisation', async () => {
    const organisationDto: OrganisationDto = {
      name: 'Organisation',
      alternateName: '',
      email: 'email@example.com',
      url: 'http://example.com',
      address: '123 Fake Street',
      telephone: '122356',
      fax: '',
    };

    const organisation = organisationFactory.build();
    const version = organisationVersionFactory.build({
      organisation: organisation,
    });
    const response = createMock<Response>();
    const request = createDefaultMockRequest({
      user: userFactory.build(),
    });

    organisationVersionsService.findByIdWithOrganisation.mockResolvedValue(
      version,
    );

    await controller.update(
      organisation.id,
      version.id,
      organisationDto,
      response,
      request,
    );

    expect(checkCanViewOrganisation).toHaveBeenCalledWith(
      request,
      organisation,
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

function createOrganisations(): Organisation[] {
  return organisationFactory.buildList(5, {
    professions: professionFactory.buildList(2),
  });
}

function createOrganisation(): Organisation {
  return organisationFactory.build({
    professions: professionFactory.buildList(2),
  });
}
