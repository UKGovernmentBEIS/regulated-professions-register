import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import QualificationPresenter from '../qualifications/presenters/qualification.presenter';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import industryFactory from '../testutils/factories/industry';
import professionFactory from '../testutils/factories/profession';
import { translationOf } from '../testutils/translation-of';
import { ProfessionVersionsService } from './profession-versions.service';

import { ProfessionsController } from './professions.controller';

import { Organisation } from '../organisations/organisation.entity';
import {
  ProfessionToOrganisation,
  OrganisationRole,
} from './profession-to-organisation.entity';

import organisationFactory from '../testutils/factories/organisation';
import { NationsListPresenter } from '../nations/presenters/nations-list.presenter';
import { Nation } from '../nations/nation';
import { ShowTemplate } from './interfaces/show-template.interface';

jest.mock('../organisations/organisation.entity');
jest.mock('../nations/presenters/nations-list.presenter');

const mockNationsHtml = '<ul><li>Mock nations html</li></ul>';

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
      controllers: [ProfessionsController],
    }).compile();

    controller = module.get<ProfessionsController>(ProfessionsController);
  });

  describe('show', () => {
    it('should throw an error when the slug does not match a profession', async () => {
      professionVersionsService.findLiveBySlug.mockResolvedValue(null);

      await expect(async () => {
        await controller.show('example-invalid-slug');
      }).rejects.toThrowError(NotFoundException);
    });

    describe('when the Profession has a single Organisation', () => {
      it('should return populated template params', async () => {
        const industry = industryFactory.build({ name: 'industries.example' });
        const profession = professionFactory.build({
          id: 'profession-id',
          name: 'Example Profession',
          occupationLocations: ['GB-ENG'],
          industries: [industry],
        });

        professionVersionsService.findLiveBySlug.mockResolvedValue(profession);

        (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
          (organisation) => organisation,
        );

        (
          NationsListPresenter.prototype.htmlList as jest.Mock
        ).mockResolvedValue(mockNationsHtml);

        const expectedOrganisations = [
          {
            ...profession.professionToOrganisations[0].organisation,
            role: profession.professionToOrganisations[0].role,
          },
        ];

        const result = await controller.show('example-slug');

        expect(result).toEqual({
          profession: profession,
          qualifications: await new QualificationPresenter(
            profession.qualification,
            createMockI18nService(),
          ).summaryList(false, true),
          nations: mockNationsHtml,
          industries: [translationOf('industries.example')],
          organisations: expectedOrganisations,
        } as ShowTemplate);

        expect(professionVersionsService.findLiveBySlug).toBeCalledWith(
          'example-slug',
        );
        expect(NationsListPresenter).toBeCalledWith(
          [Nation.find('GB-ENG')],
          i18nService,
        );
      });
    });

    describe('when the Profession has an additional Organisation', () => {
      it('should return populated template params', async () => {
        const industry = industryFactory.build({ name: 'industries.example' });
        const organisation1 = organisationFactory.build();
        const organisation2 = organisationFactory.build();

        const profession = professionFactory.build({
          id: 'profession-id',
          name: 'Example Profession',
          occupationLocations: ['GB-ENG'],
          industries: [industry],
          professionToOrganisations: [
            {
              organisation: organisation1,
              role: OrganisationRole.AdditionalRegulator,
            },
            {
              organisation: organisation2,
              role: OrganisationRole.PrimaryRegulator,
            },
          ] as ProfessionToOrganisation[],
        });

        professionVersionsService.findLiveBySlug.mockResolvedValue(profession);

        (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
          (organisation) => organisation,
        );

        (
          NationsListPresenter.prototype.htmlList as jest.Mock
        ).mockResolvedValue(mockNationsHtml);

        const expectedOrganisations = [
          {
            ...organisation2,
            role: OrganisationRole.PrimaryRegulator,
          },
          {
            ...organisation1,
            role: OrganisationRole.AdditionalRegulator,
          },
        ];

        const result = await controller.show('example-slug');

        expect(result).toEqual({
          profession: profession,
          qualifications: await new QualificationPresenter(
            profession.qualification,
            createMockI18nService(),
          ).summaryList(false, true),
          nations: mockNationsHtml,
          industries: [translationOf('industries.example')],
          organisations: expectedOrganisations,
        } as ShowTemplate);

        expect(professionVersionsService.findLiveBySlug).toBeCalledWith(
          'example-slug',
        );
        expect(NationsListPresenter).toBeCalledWith(
          [Nation.find('GB-ENG')],
          i18nService,
        );
      });
    });

    describe('publishing with missing data', () => {
      describe('when the Profession has no industries set', () => {
        it('passes an empty array for the industries', async () => {
          const profession = professionFactory.build({
            industries: [],
          });

          professionVersionsService.findLiveBySlug.mockResolvedValue(
            profession,
          );

          (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
            (organisation) => organisation,
          );

          const result = await controller.show('example-slug');

          expect(result).toEqual(
            expect.objectContaining({
              industries: [],
            }),
          );
        });
      });

      describe('when the Profession has no nations set', () => {
        it('passes an empty array for NationsListPresenter', async () => {
          const profession = professionFactory.build({
            occupationLocations: undefined,
          });

          professionVersionsService.findLiveBySlug.mockResolvedValue(
            profession,
          );

          (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
            (organisation) => organisation,
          );

          await controller.show('example-slug');

          expect(NationsListPresenter).toBeCalledWith([], i18nService);
        });
      });

      describe('when the Profession has no qualification set', () => {
        it('passes a null value for the qualification', async () => {
          const profession = professionFactory.build({
            qualification: null,
            occupationLocations: ['GB-ENG'],
            industries: [industryFactory.build({ name: 'industries.example' })],
          });

          professionVersionsService.findLiveBySlug.mockResolvedValue(
            profession,
          );

          (Organisation.withLatestLiveVersion as jest.Mock).mockImplementation(
            (organisation) => organisation,
          );

          (
            NationsListPresenter.prototype.htmlList as jest.Mock
          ).mockResolvedValue(mockNationsHtml);

          const result = await controller.show('example-slug');

          expect(result).toEqual({
            profession: profession,
            qualifications: null,
            nations: mockNationsHtml,
            industries: [translationOf('industries.example')],
            organisations: [
              profession.professionToOrganisations[0].organisation,
            ],
          } as ShowTemplate);
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});
