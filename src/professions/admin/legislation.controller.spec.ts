import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import legislationFactory from '../../testutils/factories/legislation';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import userFactory from '../../testutils/factories/user';
import { translationOf } from '../../testutils/translation-of';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import { ProfessionVersionsService } from '../profession-versions.service';
import { ProfessionsService } from '../professions.service';
import LegislationDto from './dto/legislation.dto';
import { LegislationController } from './legislation.controller';
import * as sortLegislationsByIndexModule from '../helpers/sort-legislations-by-index.helper';
import { stringOfLength } from '../../testutils/string-of-length';
import {
  MAX_MULTI_LINE_LENGTH,
  MAX_URL_LENGTH,
} from '../../helpers/input-limits';

jest.mock('../../users/helpers/check-can-change-profession');

describe(LegislationController, () => {
  let controller: LegislationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let response: DeepMocked<Response>;
  let i18nService: I18nService;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegislationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<LegislationController>(LegislationController);
  });

  describe('edit', () => {
    describe('when the Profession contains a single legislation', () => {
      it('renders the Legislation page, passing in any values on the Profession that have already been set', async () => {
        const legislation = legislationFactory.build({
          name: 'Legal Services Act 2007',
          url: 'http://www.example.com',
        });
        const profession = professionFactory.build({
          id: 'profession-id',
        });

        const version = professionVersionFactory.build({
          id: 'version-id',
          legislations: [legislation],
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);
        const sortLegislationsByIndexSpy = jest
          .spyOn(sortLegislationsByIndexModule, 'sortLegislationsByIndex')
          .mockImplementation((legislations) => legislations);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'version-id', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/legislation',
          expect.objectContaining({
            legislation: legislation,
            captionText: translationOf('professions.form.captions.edit'),
          }),
        );
        expect(sortLegislationsByIndexSpy).toHaveBeenCalledWith(
          version.legislations,
        );
      });

      it('checks the user has permission to view the Profession', async () => {
        const profession = professionFactory.build({
          id: 'profession-id',
        });
        const version = professionVersionFactory.build({
          id: 'version-id',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);
        const sortLegislationsByIndexSpy = jest
          .spyOn(sortLegislationsByIndexModule, 'sortLegislationsByIndex')
          .mockImplementation((legislations) => legislations);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'version-id', request);

        expect(checkCanChangeProfession).toHaveBeenCalledWith(
          request,
          profession,
        );
        expect(sortLegislationsByIndexSpy).toHaveBeenCalledWith(
          version.legislations,
        );
      });
    });

    describe('when the Profession contains a second Legislation', () => {
      it('renders the Legislation page, passing in any values on the Profession that have already been set', async () => {
        const legislation1 = legislationFactory.build({
          name: 'Legal Services Act 2007',
          url: 'http://www.example.com',
        });

        const legislation2 = legislationFactory.build({
          name: 'Another Legal Services Act 2007',
          url: 'http://www.another-example.com',
        });

        const profession = professionFactory.build({
          id: 'profession-id',
        });

        const version = professionVersionFactory.build({
          id: 'version-id',
          legislations: [legislation1, legislation2],
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);
        const sortLegislationsByIndexSpy = jest
          .spyOn(sortLegislationsByIndexModule, 'sortLegislationsByIndex')
          .mockImplementation((legislations) => legislations);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'version-id', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/legislation',
          expect.objectContaining({
            legislation: legislation1,
            secondLegislation: legislation2,
            captionText: translationOf('professions.form.captions.edit'),
          }),
        );
        expect(sortLegislationsByIndexSpy).toHaveBeenCalledWith(
          version.legislations,
        );
      });
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      it('creates a new Legislation on the Profession and redirects to Check your answers', async () => {
        const profession = professionFactory.build({ id: 'profession-id' });
        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
        });

        const dto: LegislationDto = {
          link: 'www.legal-legislation.com',
          nationalLegislation: 'Legal Services Act 2008',
        };

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          response,
          'profession-id',
          'version-id',
          dto,
          request,
        );

        expect(professionVersionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            legislations: [
              expect.objectContaining({
                url: 'http://www.legal-legislation.com',
                name: 'Legal Services Act 2008',
                index: 0,
              }),
            ],
            profession: profession,
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/check-your-answers',
        );
      });
    });

    describe('when a second Legislation is entered', () => {
      it('creates two new Legislations on the Profession and redirects to Check your answers', async () => {
        const profession = professionFactory.build({ id: 'profession-id' });
        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
        });

        const dto: LegislationDto = {
          link: 'http://www.legal-legislation.com',
          nationalLegislation: 'Legal Services Act 2008',
          secondLink: 'http://www.another-legal-legislation.com',
          secondNationalLegislation: 'Another Legal Services Act 2008',
        };

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          response,
          'profession-id',
          'version-id',
          dto,
          request,
        );

        expect(professionVersionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            legislations: [
              expect.objectContaining({
                url: 'http://www.legal-legislation.com',
                name: 'Legal Services Act 2008',
                index: 0,
              }),
              expect.objectContaining({
                url: 'http://www.another-legal-legislation.com',
                name: 'Another Legal Services Act 2008',
                index: 1,
              }),
            ],
            profession: profession,
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/check-your-answers',
        );
      });
    });

    describe('when provided URLs are mis-formatted', () => {
      it('correctly formats the URLs before saving', async () => {
        const profession = professionFactory.build({ id: 'profession-id' });
        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
        });

        const dto: LegislationDto = {
          link: 'www.legal-legislation.com',
          nationalLegislation: 'Legal Services Act 2008',
          secondLink: 'www.another-legal-legislation.com   ',
          secondNationalLegislation: 'Another Legal Services Act 2008',
        };

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          response,
          'profession-id',
          'version-id',
          dto,
          request,
        );

        expect(professionVersionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            legislations: [
              expect.objectContaining({
                url: 'http://www.legal-legislation.com',
                name: 'Legal Services Act 2008',
              }),
              expect.objectContaining({
                url: 'http://www.another-legal-legislation.com',
                name: 'Another Legal Services Act 2008',
              }),
            ],
            profession: profession,
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/check-your-answers',
        );
      });
    });

    describe('when there is a validation error', () => {
      describe('when required parameters are not entered', () => {
        it('renders the edit page with errors and does not update the Profession', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });
          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
          });

          const dto: LegislationDto = {
            link: '',
            nationalLegislation: '',
          };

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          const request = createDefaultMockRequest({
            user: userFactory.build(),
          });

          await controller.update(
            response,
            'profession-id',
            'version-id',
            dto,
            request,
          );

          expect(professionVersionsService.save).not.toHaveBeenCalled();

          expect(response.render).toHaveBeenCalledWith(
            'admin/professions/legislation',
            expect.objectContaining({
              errors: {
                nationalLegislation: {
                  text: 'professions.form.errors.legislation.nationalLegislation.empty',
                },
              },
            }),
          );
        });
      });

      describe('when the link is invalid', () => {
        it('renders the edit page with errors and does not update the Profession', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });
          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
          });

          const dto: LegislationDto = {
            link: 'bad link',
            nationalLegislation: 'national legislation value',
          };

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          const request = createDefaultMockRequest({
            user: userFactory.build(),
          });

          await controller.update(
            response,
            'profession-id',
            'version-id',
            dto,
            request,
          );

          expect(professionVersionsService.save).not.toHaveBeenCalled();

          expect(response.render).toHaveBeenCalledWith(
            'admin/professions/legislation',
            expect.objectContaining({
              errors: {
                link: {
                  text: 'professions.form.errors.legislation.link.invalid',
                },
              },
            }),
          );
        });
      });

      describe('when the entries are too long', () => {
        it('renders the edit page with errors and does not update the Profession', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });
          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
          });

          const dto: LegislationDto = {
            link: `http://example.com/?data=${stringOfLength(
              MAX_URL_LENGTH + 1,
            )}`,
            nationalLegislation: stringOfLength(MAX_MULTI_LINE_LENGTH + 1),
          };

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          const request = createDefaultMockRequest({
            user: userFactory.build(),
          });

          await controller.update(
            response,
            'profession-id',
            'version-id',
            dto,
            request,
          );

          expect(professionVersionsService.save).not.toHaveBeenCalled();

          expect(response.render).toHaveBeenCalledWith(
            'admin/professions/legislation',
            expect.objectContaining({
              errors: {
                nationalLegislation: {
                  text: 'professions.form.errors.legislation.nationalLegislation.long',
                },
                link: {
                  text: 'professions.form.errors.legislation.link.long',
                },
              },
            }),
          );
        });
      });
    });

    it('checks the user has permission to update the Profession', async () => {
      const profession = professionFactory.build({
        id: 'profession-id',
      });
      const version = professionVersionFactory.build({
        id: 'version-id',
      });

      professionsService.findWithVersions.mockResolvedValue(profession);
      professionVersionsService.findWithProfession.mockResolvedValue(version);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const dto: LegislationDto = {
        link: 'www.legal-legislation.com',
        nationalLegislation: 'Legal Services Act 2008',
      };

      await controller.update(
        response,
        'profession-id',
        'version-id',
        dto,
        request,
      );

      expect(checkCanChangeProfession).toHaveBeenCalledWith(
        request,
        profession,
      );
    });

    it('sorts any exiting legislation', async () => {
      const legislation1 = legislationFactory.build({
        url: 'www.gas-legislation.com',
        name: 'Gas Safety Legislation',
      });

      const legislation2 = legislationFactory.build({
        url: 'www.another-gas-legislation.com',
        name: 'Another Gas Safety Legislation',
      });

      const profession = professionFactory.build({
        id: 'profession-id',
      });
      const version = professionVersionFactory.build({
        id: 'version-id',
        legislations: [legislation1, legislation2],
      });

      professionsService.findWithVersions.mockResolvedValue(profession);
      professionVersionsService.findWithProfession.mockResolvedValue(version);
      const sortLegislationsByIndexSpy = jest
        .spyOn(sortLegislationsByIndexModule, 'sortLegislationsByIndex')
        .mockImplementation((legislations) => legislations);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const dto: LegislationDto = {
        link: 'www.legal-legislation.com',
        nationalLegislation: 'Legal Services Act 2008',
      };

      await controller.update(
        response,
        'profession-id',
        'version-id',
        dto,
        request,
      );

      expect(sortLegislationsByIndexSpy).toHaveBeenCalledWith([
        legislation1,
        legislation2,
      ]);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});
