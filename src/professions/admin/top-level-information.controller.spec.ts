import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import professionFactory from '../../testutils/factories/profession';

import { ProfessionsService } from '../professions.service';
import { TopLevelInformationController } from './top-level-information.controller';

describe('TopLevelInformationController', () => {
  let controller: TopLevelInformationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let response: DeepMocked<Response>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopLevelInformationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<TopLevelInformationController>(
      TopLevelInformationController,
    );
  });

  describe('edit', () => {
    describe('when editing a just-created, blank Profession', () => {
      it('should show a blank name', async () => {
        const blankProfession = professionFactory
          .justCreated('profession-id')
          .build();

        professionsService.findWithVersions.mockResolvedValue(blankProfession);

        await controller.edit(response, 'profession-id', 'false');

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/top-level-information',
          expect.objectContaining({
            name: undefined,
          }),
        );
      });
    });

    describe('when an existing Profession is found', () => {
      it('should pre-fill the Profession name', async () => {
        const profession = professionFactory.build({
          name: 'Example Profession',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);

        await controller.edit(response, 'profession-id', 'false');

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/top-level-information',
          expect.objectContaining({
            name: 'Example Profession',
          }),
        );
      });
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      it('updates the Profession and redirects to the next page in the journey', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build();

        professionsService.findWithVersions.mockResolvedValue(profession);

        const topLevelDetailsDto = {
          name: 'Gas Safe Engineer',
        };

        await controller.update(
          topLevelDetailsDto,
          response,
          'profession-id',
          'version-id',
        );

        expect(professionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'profession-id',
            name: 'Gas Safe Engineer',
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/scope/edit',
        );
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not create a profession, and re-renders the top level information view with errors', async () => {
        const topLevelDetailsDtoWithNoAnswers = {
          name: '',
        };

        await controller.update(
          topLevelDetailsDtoWithNoAnswers,
          response,
          'profession-id',
          'version-id',
        );

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/top-level-information',
          expect.objectContaining({
            errors: {
              name: {
                text: 'professions.form.errors.name.empty',
              },
            },
          }),
        );

        expect(professionsService.save).not.toHaveBeenCalled();
      });
    });

    describe('the "change" query param', () => {
      describe('when set to true', () => {
        it('redirects to check your answers on submit', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });

          professionsService.findWithVersions.mockResolvedValue(profession);

          const topLevelDetailsDtoWithChangeParam = {
            name: 'A new profession',
            change: 'true',
          };

          await controller.update(
            topLevelDetailsDtoWithChangeParam,
            response,
            'profession-id',
            'version-id',
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/check-your-answers',
          );
        });
      });

      describe('when set to false', () => {
        it('continues to the next step in the journey', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });

          professionsService.findWithVersions.mockResolvedValue(profession);

          const topLevelDetailsDtoWithoutChangeParam = {
            name: 'A new profession',
          };

          await controller.update(
            topLevelDetailsDtoWithoutChangeParam,
            response,
            'profession-id',
            'version-id',
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/scope/edit',
          );
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
