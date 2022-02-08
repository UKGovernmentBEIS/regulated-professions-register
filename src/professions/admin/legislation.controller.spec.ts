import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import legislationFactory from '../../testutils/factories/legislation';
import professionFactory from '../../testutils/factories/profession';
import { ProfessionsService } from '../professions.service';
import LegislationDto from './dto/legislation.dto';
import { LegislationController } from './legislation.controller';

describe(LegislationController, () => {
  let controller: LegislationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let response: DeepMocked<Response>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegislationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<LegislationController>(LegislationController);
  });

  describe('edit', () => {
    it('renders the Legislation page, passing in any values on the Profession that have already been set', async () => {
      const legislation = legislationFactory.build({
        name: 'Legal Services Act 2007',
        url: 'www.example.com',
      });
      const profession = professionFactory.build({
        id: 'profession-id',
        legislation,
      });

      professionsService.find.mockResolvedValue(profession);

      await controller.edit(response, 'profession-id', false);

      expect(response.render).toHaveBeenCalledWith(
        'admin/professions/legislation',
        expect.objectContaining({
          legislation: legislation,
        }),
      );
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      it('creates a new Legislation on the Profession and redirects to Check your answers', async () => {
        const profession = professionFactory.build({ id: 'profession-id' });

        const dto: LegislationDto = {
          link: 'www.legal-legislation.com',
          nationalLegislation: 'Legal Services Act 2008',
          change: false,
        };

        professionsService.find.mockResolvedValue(profession);

        await controller.update(response, 'profession-id', dto);

        expect(professionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            legislation: expect.objectContaining({
              url: 'www.legal-legislation.com',
              name: 'Legal Services Act 2008',
            }),
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/check-your-answers',
        );
      });
    });

    describe('when required parameters are not entered', () => {
      it('renders the edit page with errors and does not update the Profession', async () => {
        const profession = professionFactory.build({ id: 'profession-id' });

        const dto: LegislationDto = {
          link: undefined,
          nationalLegislation: undefined,
          change: false,
        };

        professionsService.find.mockResolvedValue(profession);

        await controller.update(response, 'profession-id', dto);

        expect(professionsService.save).not.toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/legislation',
          expect.objectContaining({
            errors: {
              link: {
                text: 'professions.form.errors.legislation.link.empty',
              },
              nationalLegislation: {
                text: 'professions.form.errors.legislation.nationalLegislation.empty',
              },
            },
          }),
        );
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
