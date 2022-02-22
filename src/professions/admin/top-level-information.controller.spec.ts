import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { OrganisationsService } from '../../organisations/organisations.service';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { ProfessionsService } from '../professions.service';
import { RegulatedAuthoritiesSelectPresenter } from './regulated-authorities-select-presenter';
import { TopLevelInformationController } from './top-level-information.controller';
import { when } from 'jest-when';

describe('TopLevelInformationController', () => {
  let controller: TopLevelInformationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let response: DeepMocked<Response>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    organisationsService = createMock<OrganisationsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopLevelInformationController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        { provide: OrganisationsService, useValue: organisationsService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<TopLevelInformationController>(
      TopLevelInformationController,
    );
  });

  describe('edit', () => {
    describe('when editing a just-created, blank Profession', () => {
      it('should render a blank name and a list of Organisations to be displayed in the Selects with none of them selected', async () => {
        const blankProfession = professionFactory
          .justCreated('profession-id')
          .build();

        professionsService.findWithVersions.mockResolvedValue(blankProfession);

        const organisations = organisationFactory.buildList(2);
        organisationsService.all.mockResolvedValue(organisations);

        const regulatedAuthoritiesSelectPresenter =
          new RegulatedAuthoritiesSelectPresenter(organisations, null);

        await controller.edit(response, 'profession-id', 'false');

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/top-level-information',
          expect.objectContaining({
            name: undefined,
            regulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenter.selectArgs(),
            additionalRegulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenter.selectArgs(),
          }),
        );
      });
    });

    describe('when an existing Profession is found', () => {
      it('should pre-fill the Profession name and both Organisations', async () => {
        const organisation = organisationFactory.build({
          name: 'Example org',
          id: 'example-org-id',
        });
        const additionalOrganisation = organisationFactory.build({
          name: 'Example org 2',
          id: 'example-org-id-2',
        });

        const profession = professionFactory.build({
          name: 'Example Profession',
          organisation: organisation,
          additionalOrganisation: additionalOrganisation,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);

        const organisations = [
          organisation,
          additionalOrganisation,
          organisationFactory.build(),
        ];
        organisationsService.all.mockResolvedValue(organisations);

        const regulatedAuthoritiesSelectPresenterWithSelectedOrganisation =
          new RegulatedAuthoritiesSelectPresenter(organisations, organisation);

        const regulatedAuthoritiesSelectPresenterWithSelectedAdditionalOrganisation =
          new RegulatedAuthoritiesSelectPresenter(
            organisations,
            additionalOrganisation,
          );

        await controller.edit(response, 'profession-id', 'false');

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/top-level-information',
          expect.objectContaining({
            name: 'Example Profession',
            regulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenterWithSelectedOrganisation.selectArgs(),
            additionalRegulatedAuthoritiesSelectArgs:
              regulatedAuthoritiesSelectPresenterWithSelectedAdditionalOrganisation.selectArgs(),
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
          regulatoryBody: 'example-org-id',
          additionalRegulatoryBody: 'other-example-org-id',
        };

        const newOrganisation = organisationFactory.build({
          name: 'Council of Gas Safe Engineers',
        });

        const newAdditionalOrganisation = organisationFactory.build();

        when(organisationsService.find)
          .calledWith('example-org-id')
          .mockResolvedValue(newOrganisation);

        when(organisationsService.find)
          .calledWith('other-example-org-id')
          .mockResolvedValue(newAdditionalOrganisation);

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
            organisation: newOrganisation,
            additionalOrganisation: newAdditionalOrganisation,
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
          regulatoryBody: null,
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
              regulatoryBody: {
                text: 'professions.form.errors.regulatoryBody.empty',
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
            regulatoryBody: 'example-org-id',
            change: 'true',
          };

          const organisation = organisationFactory.build();
          organisationsService.find.mockResolvedValue(organisation);

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
            regulatoryBody: 'example-org-id',
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
