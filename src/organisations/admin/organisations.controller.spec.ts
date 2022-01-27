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

import { OrganisationSummaryPresenter } from '../presenters/organisation-summary.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { SummaryList } from '../../common/interfaces/summary-list';
import { ShowTemplate } from '../interfaces/show-template.interface';
import { IndustriesService } from '../../industries/industries.service';
import { IndexTemplate } from './interfaces/index-template.interface';
import { OrganisationsFilterHelper } from '../helpers/organisations-filter.helper';
import { FilterDto } from './dto/filter.dto';
import { FilterInput } from '../../common/interfaces/filter-input.interface';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { DeepPartial } from 'fishery';

jest.mock('./presenters/organisations.presenter');
jest.mock('../presenters/organisation.presenter');
jest.mock('../presenters/organisation-summary.presenter');
jest.mock('../helpers/organisations-filter.helper');

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
    describe('when no filter is provided', () => {
      it('should return template params for all organisations', async () => {
        const templateParams: IndexTemplate = {
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
            industries: [],
          },
          industriesCheckboxArgs: [],
        };

        const organisations = createOrganisations();
        const industries = industryFactory.buildList(5);

        (
          OrganisationsPresenter.prototype as DeepMocked<OrganisationsPresenter>
        ).present.mockResolvedValue(templateParams);

        (
          OrganisationsFilterHelper.prototype as DeepMocked<OrganisationsFilterHelper>
        ).filter.mockReturnValue(organisations);

        expect(await controller.index()).toEqual(templateParams);

        expect(organisationsService.allWithProfessions).toHaveBeenCalled();

        expect(OrganisationsFilterHelper).toBeCalledWith(organisations);
        expect(OrganisationsFilterHelper.prototype.filter).toBeCalledWith({
          keywords: '',
          industries: [],
        } as FilterInput);

        expect(OrganisationsPresenter).toHaveBeenCalledWith(
          industries,
          {
            keywords: '',
            industries: [],
          },
          organisations,
          i18nService,
        );
      });
    });

    describe('when a filter is provided', () => {
      it('should return template params for filtered organisations', async () => {
        const templateParams: IndexTemplate = {
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
            industries: [],
          },
          industriesCheckboxArgs: [],
        };

        const organisations = createOrganisations();
        const industries = industryFactory.buildList(5);

        (
          OrganisationsPresenter.prototype as DeepMocked<OrganisationsPresenter>
        ).present.mockResolvedValue(templateParams);

        (
          OrganisationsFilterHelper.prototype as DeepMocked<OrganisationsFilterHelper>
        ).filter.mockReturnValue([organisations[1], organisations[3]]);

        expect(
          await controller.index({
            keywords: 'example keywords',
            industries: [industries[1].id],
          } as FilterDto),
        ).toEqual(templateParams);

        expect(organisationsService.allWithProfessions).toHaveBeenCalled();

        expect(OrganisationsFilterHelper).toBeCalledWith(organisations);
        expect(OrganisationsFilterHelper.prototype.filter).toBeCalledWith({
          keywords: 'example keywords',
          industries: [industries[1]],
        } as FilterInput);

        expect(OrganisationsPresenter).toHaveBeenCalledWith(
          industries,
          {
            keywords: 'example keywords',
            industries: [industries[1]],
          },
          [organisations[1], organisations[3]],
          i18nService,
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
      const request = createMock<RequestWithAppSession>({
        appSession: {
          user: user as DeepPartial<any>,
        },
      });

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

  describe('show', () => {
    it('should return variables for the show template', async () => {
      const organisation = createOrganisation();
      organisationsService.findBySlugWithProfessions.mockResolvedValue(
        organisation,
      );

      const showTemplate: ShowTemplate = {
        organisation,
        summaryList: {
          classes: 'govuk-summary-list--no-border',
          rows: [],
        },
        professions: [],
      };

      (
        OrganisationSummaryPresenter.prototype as DeepMocked<OrganisationSummaryPresenter>
      ).present.mockResolvedValue(showTemplate);

      expect(await controller.show('slug')).toEqual(showTemplate);

      expect(
        organisationsService.findBySlugWithProfessions,
      ).toHaveBeenCalledWith('slug');

      expect(OrganisationSummaryPresenter).toHaveBeenCalledWith(
        organisation,
        i18nService,
      );
    });
  });

  describe('edit', () => {
    it('should return the organisation', async () => {
      const organisation = createOrganisation();

      organisationsService.findWithVersion.mockResolvedValue(organisation);

      expect(await controller.edit(organisation.id, 'version-uuid')).toEqual(
        organisation,
      );
      expect(organisationsService.findWithVersion).toHaveBeenCalledWith(
        organisation.id,
        'version-uuid',
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

          const organisationDto: OrganisationDto = {
            name: 'Organisation',
            alternateName: '',
            email: 'email@example.com',
            url: 'http://example.com',
            contactUrl: 'http://example.com',
            address: '123 Fake Street',
            telephone: '122356',
            fax: '',
          };

          const organisation = organisationFactory.build({ slug: '' });
          const version = organisationVersionFactory.build({});

          organisationsService.find.mockResolvedValue(organisation);
          organisationVersionsService.find.mockResolvedValue(version);

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
          );

          expect(organisationsService.save).toHaveBeenCalledWith(
            newOrganisation,
          );

          expect(organisationVersionsService.save).toHaveBeenCalledWith(
            newVersion,
          );

          const updatedOrganisation = Organisation.withVersion(
            organisation,
            newVersion,
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

        describe('when the organisation already has a slug', () => {
          it('Does not re set the name', async () => {
            const organisationDto: OrganisationDto = {
              name: 'Organisation',
              alternateName: '',
              email: 'email@example.com',
              url: 'http://example.com',
              contactUrl: 'http://example.com',
              address: '123 Fake Street',
              telephone: '122356',
              fax: '',
            };

            const organisation = organisationFactory.build({
              name: 'My awesome organisation',
              slug: 'my-awesome-organisation',
            });
            const version = organisationVersionFactory.build({});
            const response = createMock<Response>();

            organisationsService.find.mockResolvedValue(organisation);
            organisationVersionsService.find.mockResolvedValue(version);

            const newVersion = {
              ...version,
              ...OrganisationVersion.fromDto(organisationDto),
            };

            await controller.update(
              organisation.id,
              version.id,
              organisationDto,
              response,
            );

            expect(organisationsService.save).not.toHaveBeenCalled();
            expect(organisationVersionsService.save).toHaveBeenCalledWith(
              newVersion,
            );
          });
        });
      });

      describe('when confirm is set', () => {
        describe('when the slug is not set', () => {
          it('should set the slug and save and version', async () => {
            const organisation = organisationFactory.build({ slug: '' });
            const version = organisationVersionFactory.build();
            const response = createMock<Response>();
            const organisationDto = createMock<OrganisationDto>({
              confirm: true,
            });

            organisationsService.find.mockResolvedValue(organisation);
            organisationVersionsService.find.mockResolvedValue(version);

            await controller.update(
              'some-uuid',
              'some-other-uuid',
              organisationDto,
              response,
            );

            expect(organisationsService.find).toHaveBeenCalledWith('some-uuid');
            expect(organisationVersionsService.find).toHaveBeenCalledWith(
              'some-other-uuid',
            );

            expect(organisationsService.setSlug).toHaveBeenCalledWith(
              organisation,
            );
            expect(organisationVersionsService.save).toHaveBeenCalledWith(
              version,
            );

            expect(response.render).toHaveBeenCalledWith(
              'admin/organisations/complete',
              organisation,
            );
          });
        });

        describe('when the slug is set', () => {
          it('should save the version and not set the slug again', async () => {
            const organisation = organisationFactory.build({
              slug: 'some-slug',
            });
            const version = organisationVersionFactory.build();
            const response = createMock<Response>();
            const organisationDto = createMock<OrganisationDto>({
              confirm: true,
            });

            organisationsService.find.mockResolvedValue(organisation);
            organisationVersionsService.find.mockResolvedValue(version);

            await controller.update(
              'some-uuid',
              'some-other-uuid',
              organisationDto,
              response,
            );

            expect(organisationsService.setSlug).not.toHaveBeenCalledWith(
              organisation,
            );
            expect(organisationVersionsService.save).toHaveBeenCalledWith(
              version,
            );

            expect(response.render).toHaveBeenCalledWith(
              'admin/organisations/complete',
              organisation,
            );
          });
        });
      });
    });
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
