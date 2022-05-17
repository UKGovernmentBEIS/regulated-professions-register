import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { OrganisationsService } from '../../organisations/organisations.service';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { ProfessionsService } from '../professions.service';
import { RegulatedAuthoritiesSelectPresenter } from './presenters/regulated-authorities-select-presenter';
import { OrganisationsController } from './organisations.controller';
import { when } from 'jest-when';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import { OrganisationVersionsService } from '../../organisations/organisation-versions.service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import userFactory from '../../testutils/factories/user';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import {
  ProfessionToOrganisation,
  OrganisationRole,
} from '../profession-to-organisation.entity';
import { AuthorityAndRoleArgs } from './interfaces/authority-and-role-args';
import professionVersionFactory from '../../testutils/factories/profession-version';
import { ProfessionVersionStatus } from '../profession-version.entity';

jest.mock('../../users/helpers/check-can-change-profession');
jest.mock('./presenters/regulated-authorities-select-presenter');

describe('OrganisationsController', () => {
  let controller: OrganisationsController;
  let professionsService: DeepMocked<ProfessionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let organisationVersionsService: DeepMocked<OrganisationVersionsService>;
  let response: DeepMocked<Response>;
  let i18nService: I18nService;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    organisationsService = createMock<OrganisationsService>();
    organisationVersionsService = createMock<OrganisationVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationsController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        { provide: OrganisationsService, useValue: organisationsService },
        {
          provide: OrganisationVersionsService,
          useValue: organisationVersionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<OrganisationsController>(OrganisationsController);
  });

  describe('edit', () => {
    describe('when editing a just-created, blank Profession', () => {
      it('should show five lists of Organisations to be displayed in the Selects with none of them selected', async () => {
        const blankProfession = professionFactory
          .justCreated('profession-id')
          .build({
            versions: [
              professionVersionFactory.build({
                status: ProfessionVersionStatus.Draft,
              }),
            ],
          });

        professionsService.findWithVersions.mockResolvedValue(blankProfession);

        const organisations = organisationFactory.buildList(2);
        organisationVersionsService.allLiveOrDraft.mockResolvedValue(
          organisations,
        );

        const authoritiesAndRoles: AuthorityAndRoleArgs = {
          authorities: [],
          roles: [],
        };

        jest
          .spyOn(
            RegulatedAuthoritiesSelectPresenter.prototype,
            'authoritiesAndRoles',
          )
          .mockImplementation(() => authoritiesAndRoles);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'false', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/organisations',
          expect.objectContaining({
            selectArgsArray: Array.from({ length: 25 }, () => ({
              ...authoritiesAndRoles,
            })),

            captionText: translationOf('professions.form.captions.add'),
          }),
        );

        expect(organisationVersionsService.allLiveOrDraft).toHaveBeenCalled();
      });
    });

    describe('editing an existing draft profession', () => {
      it('should pre-fill both Organisations with three blank select args', async () => {
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
          professionToOrganisations: [
            {
              organisation: organisation,
              role: OrganisationRole.AwardingBody,
            },
            {
              organisation: additionalOrganisation,
              role: OrganisationRole.PrimaryRegulator,
            },
          ] as ProfessionToOrganisation[],
          versions: [
            professionVersionFactory.build({
              status: ProfessionVersionStatus.Draft,
            }),
          ],
        });

        professionsService.findWithVersions.mockResolvedValue(profession);

        const organisations = [
          organisation,
          additionalOrganisation,
          organisationFactory.build(),
        ];
        organisationVersionsService.allLiveOrDraft.mockResolvedValue(
          organisations,
        );

        const regulatedAuthoritiesSelectPresenterWithSelectedOrganisation =
          new RegulatedAuthoritiesSelectPresenter(
            organisations,
            organisation,
            OrganisationRole.AwardingBody,
            createMockI18nService(),
          );

        const regulatedAuthoritiesSelectPresenterWithSelectedAdditionalOrganisation =
          new RegulatedAuthoritiesSelectPresenter(
            organisations,
            additionalOrganisation,
            OrganisationRole.PrimaryRegulator,
            i18nService,
          );

        const regulatedAuthoritiesSelectPresenter =
          new RegulatedAuthoritiesSelectPresenter(
            organisations,
            null,
            null,
            i18nService,
          );

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'false', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/organisations',
          expect.objectContaining({
            selectArgsArray: [
              regulatedAuthoritiesSelectPresenterWithSelectedOrganisation.authoritiesAndRoles(),
              regulatedAuthoritiesSelectPresenterWithSelectedAdditionalOrganisation.authoritiesAndRoles(),
              ...Array.from({ length: 23 }, () =>
                regulatedAuthoritiesSelectPresenter.authoritiesAndRoles(),
              ),
            ],
            captionText: translationOf('professions.form.captions.edit'),
          }),
        );

        expect(organisationVersionsService.allLiveOrDraft).toHaveBeenCalled();
      });
    });

    describe('editing an existing live profession', () => {
      it('should pre-fill both Organisations with three blank select args', async () => {
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
          professionToOrganisations: [
            {
              organisation: organisation,
              role: OrganisationRole.AwardingBody,
            },
            {
              organisation: additionalOrganisation,
              role: OrganisationRole.PrimaryRegulator,
            },
          ] as ProfessionToOrganisation[],
          versions: [
            professionVersionFactory.build({
              status: ProfessionVersionStatus.Live,
            }),
          ],
        });

        professionsService.findWithVersions.mockResolvedValue(profession);

        const organisations = [
          organisation,
          additionalOrganisation,
          organisationFactory.build(),
        ];
        organisationVersionsService.allLive.mockResolvedValue(organisations);

        const regulatedAuthoritiesSelectPresenterWithSelectedOrganisation =
          new RegulatedAuthoritiesSelectPresenter(
            organisations,
            organisation,
            OrganisationRole.AwardingBody,
            createMockI18nService(),
          );

        const regulatedAuthoritiesSelectPresenterWithSelectedAdditionalOrganisation =
          new RegulatedAuthoritiesSelectPresenter(
            organisations,
            additionalOrganisation,
            OrganisationRole.PrimaryRegulator,
            i18nService,
          );

        const regulatedAuthoritiesSelectPresenter =
          new RegulatedAuthoritiesSelectPresenter(
            organisations,
            null,
            null,
            i18nService,
          );

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'false', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/organisations',
          expect.objectContaining({
            selectArgsArray: [
              regulatedAuthoritiesSelectPresenterWithSelectedOrganisation.authoritiesAndRoles(),
              regulatedAuthoritiesSelectPresenterWithSelectedAdditionalOrganisation.authoritiesAndRoles(),
              ...Array.from({ length: 23 }, () =>
                regulatedAuthoritiesSelectPresenter.authoritiesAndRoles(),
              ),
            ],
            captionText: translationOf('professions.form.captions.edit'),
          }),
        );

        expect(organisationVersionsService.allLive).toHaveBeenCalled();
      });
    });

    it('checks the acting user has permission to view the page', async () => {
      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const profession = professionFactory.build();

      professionsService.findWithVersions.mockResolvedValue(profession);

      await controller.edit(response, 'profession-id', 'false', request);

      expect(checkCanChangeProfession).toHaveBeenCalledWith(
        request,
        profession,
      );
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      it('updates the Profession and redirects to the check your answers page', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build({
            versions: [
              professionVersionFactory.build({
                status: ProfessionVersionStatus.Draft,
              }),
            ],
          });

        professionsService.findWithVersions.mockResolvedValue(profession);

        const organisationsDto = {
          professionToOrganisations: [
            { organisation: 'example-org-id', role: 'primaryRegulator' },
            { organisation: 'other-example-org-id', role: 'awardingBody' },
          ],
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

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          organisationsDto,
          response,
          'profession-id',
          'version-id',
          request,
        );

        const professionToOrganisations = [
          new ProfessionToOrganisation(
            newOrganisation,
            profession,
            OrganisationRole.PrimaryRegulator,
          ),
          new ProfessionToOrganisation(
            newAdditionalOrganisation,
            profession,
            OrganisationRole.AwardingBody,
          ),
        ];

        expect(professionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'profession-id',
            professionToOrganisations: professionToOrganisations,
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/check-your-answers',
        );
      });
    });

    it('only updates with one organisation when an additional organisation is not selected', async () => {
      const profession = professionFactory.justCreated('profession-id').build({
        versions: [
          professionVersionFactory.build({
            status: ProfessionVersionStatus.Draft,
          }),
        ],
      });

      professionsService.findWithVersions.mockResolvedValue(profession);

      const organisationsDto = {
        professionToOrganisations: [
          { organisation: 'example-org-id', role: 'primaryRegulator' },
        ],
      };

      const newOrganisation = organisationFactory.build({
        name: 'Council of Gas Safe Engineers',
      });

      when(organisationsService.find)
        .calledWith('example-org-id')
        .mockResolvedValue(newOrganisation);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.update(
        organisationsDto,
        response,
        'profession-id',
        'version-id',
        request,
      );

      const professionToOrganisations = [
        new ProfessionToOrganisation(
          newOrganisation,
          profession,
          OrganisationRole.PrimaryRegulator,
        ),
      ];

      expect(professionsService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'profession-id',
          professionToOrganisations: professionToOrganisations,
        }),
      );
    });

    describe('when required parameters are not entered', () => {
      it('does not create a profession, and re-renders the top level information view with errors', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build({
            versions: [
              professionVersionFactory.build({
                status: ProfessionVersionStatus.Live,
              }),
            ],
          });

        professionsService.findWithVersions.mockResolvedValue(profession);

        const organisationsDtoWithNoAnswers = {
          professionToOrganisations: [],
        };

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          organisationsDtoWithNoAnswers,
          response,
          'profession-id',
          'version-id',
          request,
        );

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/organisations',
          expect.objectContaining({
            errors: {
              professionToOrganisations: {
                text: 'professions.form.errors.professionToOrganisations.empty',
              },
            },
          }),
        );

        expect(professionsService.save).not.toHaveBeenCalled();
      });
    });

    describe('when an organisation is missing a role', () => {
      it('does not create a profession, and re-renders the top level information view with errors', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build({
            versions: [
              professionVersionFactory.build({
                status: ProfessionVersionStatus.Live,
              }),
            ],
          });

        professionsService.findWithVersions.mockResolvedValue(profession);

        const organisationsDtoWithNoAnswers = {
          professionToOrganisations: [
            { organisation: 'example-org-id', role: 'primaryRegulator' },
            { organisation: 'example-org-id', role: '' },
          ],
        };

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          organisationsDtoWithNoAnswers,
          response,
          'profession-id',
          'version-id',
          request,
        );

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/organisations',
          expect.objectContaining({
            errors: {
              professionToOrganisations: {
                text: 'professions.form.errors.professionToOrganisations.missingRole',
              },
            },
          }),
        );

        expect(professionsService.save).not.toHaveBeenCalled();
      });
    });

    describe('when a role is missing an organisation', () => {
      it('does not create a profession, and re-renders the top level information view with errors', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build({
            versions: [
              professionVersionFactory.build({
                status: ProfessionVersionStatus.Draft,
              }),
            ],
          });

        professionsService.findWithVersions.mockResolvedValue(profession);

        const organisationsDtoWithNoAnswers = {
          professionToOrganisations: [
            { organisation: 'example-org-id', role: 'primaryRegulator' },
            { organisation: '', role: 'primaryRegulator' },
          ],
        };

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          organisationsDtoWithNoAnswers,
          response,
          'profession-id',
          'version-id',
          request,
        );

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/organisations',
          expect.objectContaining({
            errors: {
              professionToOrganisations: {
                text: 'professions.form.errors.professionToOrganisations.missingAuthority',
              },
            },
          }),
        );

        expect(professionsService.save).not.toHaveBeenCalled();
      });
    });

    it('checks the acting user has permission to update the Profession', async () => {
      const profession = professionFactory.build({
        versions: [
          professionVersionFactory.build({
            status: ProfessionVersionStatus.Live,
          }),
        ],
      });

      const organisationsDto = {
        professionToOrganisations: [],
      };

      professionsService.findWithVersions.mockResolvedValue(profession);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.update(
        organisationsDto,
        response,
        'profession-id',
        'false',
        request,
      );

      expect(checkCanChangeProfession).toHaveBeenCalledWith(
        request,
        profession,
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
