import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { OrganisationsService } from '../../organisations/organisations.service';
import { ProfessionsService } from '../../professions/professions.service';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import userFactory from '../../testutils/factories/user';
import * as getActingUserModule from '../../users/helpers/get-acting-user.helper';
import {
  DecisionDataset,
  DecisionDatasetStatus,
} from '../decision-dataset.entity';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { DecisionRoute } from '../interfaces/decision-route.interface';
import { EditDto } from './dto/edit.dto';
import * as parseEditDtoDecisionRoutesModule from './helpers/parse-edit-dto-decision-routes.helper';
import * as modifyDecisionRoutesModule from './helpers/modify-decision-routes.helper';
import { EditTemplate } from './interfaces/edit/edit-template.interface';
import { NewTemplate } from './interfaces/edit/new-template.interface';
import { RouteTemplate } from './interfaces/route-template.interface';
import { DecisionDatasetEditPresenter } from './presenters/decision-dataset-edit.presenter';
import * as checkCanChangeDatasetModule from './helpers/check-can-change-dataset.helper';
import * as checkCanPublishDatasetModule from './helpers/check-can-publish-dataset.helper';
import { EditController } from './edit.controller';
import { flashMessage } from '../../common/flash-message';
import { translationOf } from '../../testutils/translation-of';

jest.mock('./presenters/decision-dataset-edit.presenter');
jest.mock('../../common/flash-message');

const mockRouteTemplates: RouteTemplate[] = [
  {
    name: 'Example route',
    countries: [
      {
        countriesSelectArgs: [],
        decisions: {
          yes: '5',
          no: '8',
          yesAfterComp: '11',
          noAfterComp: '2',
          noOtherConditions: '1',
        },
      },
    ],
  },
];

describe('EditController', () => {
  let controller: EditController;

  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;
  let professionsService: DeepMocked<ProfessionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    decisionDatasetsService = createMock<DecisionDatasetsService>();
    professionsService = createMock<ProfessionsService>();
    organisationsService = createMock<OrganisationsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditController],
      providers: [
        {
          provide: DecisionDatasetsService,
          useValue: decisionDatasetsService,
        },
        {
          provide: ProfessionsService,
          useValue: professionsService,
        },
        {
          provide: OrganisationsService,
          useValue: organisationsService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    controller = module.get<EditController>(EditController);
  });

  describe('new', () => {
    it('sets datasetPublished to true when the dataset has a status of "Live"', async () => {
      const profession = professionFactory.build({
        id: 'example-profession-id',
      });

      const organisation = organisationFactory.build({
        id: 'example-organisation-id',
      });

      const dataset = decisionDatasetFactory.build({
        profession,
        organisation,
        year: 2016,
        status: DecisionDatasetStatus.Live,
      });

      professionsService.findWithVersions.mockResolvedValue(profession);
      organisationsService.find.mockResolvedValue(organisation);
      decisionDatasetsService.find.mockResolvedValue(dataset);

      const request = createDefaultMockRequest();

      const checkCanChangeDatasetSpy = jest
        .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
        .mockImplementation();

      const expected: NewTemplate = {
        profession,
        organisation,
        year: 2016,
        datasetPublished: true,
      };

      const result = await controller.new(
        'example-profession-id',
        'example-organisation-id',
        2016,
        request,
      );
      expect(result).toEqual(expected);
      expect(professionsService.findWithVersions).toHaveBeenCalledWith(
        'example-profession-id',
      );
      expect(organisationsService.find).toHaveBeenCalledWith(
        'example-organisation-id',
      );
      expect(decisionDatasetsService.find).toHaveBeenCalledWith(
        'example-profession-id',
        'example-organisation-id',
        2016,
      );
      expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
        request,
        profession,
        organisation,
        2016,
        true,
      );
    });

    it('sets datasetPublished to false when the dataset has a status of "Draft"', async () => {
      const profession = professionFactory.build({
        id: 'example-profession-id',
      });

      const organisation = organisationFactory.build({
        id: 'example-organisation-id',
      });

      const dataset = decisionDatasetFactory.build({
        profession,
        organisation,
        year: 2016,
        status: DecisionDatasetStatus.Draft,
      });

      professionsService.findWithVersions.mockResolvedValue(profession);
      organisationsService.find.mockResolvedValue(organisation);
      decisionDatasetsService.find.mockResolvedValue(dataset);

      const request = createDefaultMockRequest();

      const checkCanChangeDatasetSpy = jest
        .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
        .mockImplementation();

      const expected: NewTemplate = {
        profession,
        organisation,
        year: 2016,
        datasetPublished: false,
      };

      const result = await controller.new(
        'example-profession-id',
        'example-organisation-id',
        2016,
        request,
      );

      expect(result).toEqual(expected);
      expect(professionsService.findWithVersions).toHaveBeenCalledWith(
        'example-profession-id',
      );
      expect(organisationsService.find).toHaveBeenCalledWith(
        'example-organisation-id',
      );
      expect(decisionDatasetsService.find).toHaveBeenCalledWith(
        'example-profession-id',
        'example-organisation-id',
        2016,
      );
      expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
        request,
        profession,
        organisation,
        2016,
        true,
      );
    });
  });

  describe('edit', () => {
    describe('when the dataset exists', () => {
      it('presents the dataset for editing', async () => {
        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        const dataset = decisionDatasetFactory.build({
          profession,
          organisation,
          year: 2016,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);
        decisionDatasetsService.find.mockResolvedValue(dataset);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanChangeDatasetSpy = jest
          .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
          .mockImplementation();

        const request = createDefaultMockRequest();

        const expected: EditTemplate = {
          profession,
          organisation,
          year: 2016,
          routes: mockRouteTemplates,
        };

        const result = await controller.edit(
          'example-profession-id',
          'example-organisation-id',
          2016,
          request,
        );

        expect(result).toEqual(expected);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'example-profession-id',
          'example-organisation-id',
          2016,
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith(
          dataset.routes,
          i18nService,
        );
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
          request,
          profession,
          organisation,
          2016,
          true,
        );
      });
    });

    describe('when the dataset does not exist', () => {
      it('presents a default empty dataset for editing', async () => {
        const profession = professionFactory.build({
          id: 'example-profession-id',
        });

        const organisation = organisationFactory.build({
          id: 'example-organisation-id',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        organisationsService.find.mockResolvedValue(organisation);
        decisionDatasetsService.find.mockResolvedValue(null);

        (
          DecisionDatasetEditPresenter.prototype.present as jest.Mock
        ).mockReturnValue(mockRouteTemplates);

        const checkCanChangeDatasetSpy = jest
          .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
          .mockImplementation();

        const request = createDefaultMockRequest();

        const expected: EditTemplate = {
          profession,
          organisation,
          year: 2016,
          routes: mockRouteTemplates,
        };

        const result = await controller.edit(
          'example-profession-id',
          'example-organisation-id',
          2016,
          request,
        );

        expect(result).toEqual(expected);

        expect(professionsService.findWithVersions).toHaveBeenCalledWith(
          'example-profession-id',
        );
        expect(organisationsService.find).toHaveBeenCalledWith(
          'example-organisation-id',
        );
        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'example-profession-id',
          'example-organisation-id',
          2016,
        );

        expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith(
          [
            {
              name: '',
              countries: [
                {
                  code: null,
                  decisions: {
                    yes: null,
                    no: null,
                    yesAfterComp: null,
                    noAfterComp: null,
                    noOtherConditions: null,
                  },
                },
              ],
            },
          ] as DecisionRoute[],
          i18nService,
        );
        expect(
          DecisionDatasetEditPresenter.prototype.present,
        ).toHaveBeenCalled();

        expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
          request,
          profession,
          organisation,
          2016,
          false,
        );
      });
    });
  });

  describe('update', () => {
    describe('when submitting valid data', () => {
      describe('when the `action` is "publish"', () => {
        it('saves the given dataset as draft and redirects to the publication confirmation page', async () => {
          const editDto: EditDto = {
            routes: ['Example route'],
            countries: [['Brazil']],
            yeses: [['1']],
            noes: [['5']],
            yesAfterComps: [['4']],
            noAfterComps: [['7']],
            noOtherConditions: [['2']],
            action: 'publish',
          };

          const decisionRoutes: DecisionRoute[] = [
            {
              name: 'Example route',
              countries: [
                {
                  code: 'BR',
                  decisions: {
                    yes: 1,
                    no: 5,
                    yesAfterComp: 5,
                    noAfterComp: 7,
                    noOtherConditions: 3,
                  },
                },
              ],
            },
          ];

          const profession = professionFactory.build({
            id: 'example-profession-id',
          });

          const organisation = organisationFactory.build({
            id: 'example-organisation-id',
          });

          const user = userFactory.build();

          professionsService.findWithVersions.mockResolvedValue(profession);
          organisationsService.find.mockResolvedValue(organisation);
          decisionDatasetsService.find.mockResolvedValue(undefined);

          const checkCanChangeDatasetSpy = jest
            .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
            .mockImplementation();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);

          const parseEditDtoDecisionRoutesSpy = jest
            .spyOn(
              parseEditDtoDecisionRoutesModule,
              'parseEditDtoDecisionRoutes',
            )
            .mockReturnValue(decisionRoutes);
          const modifyDecisionRoutesSpy = jest.spyOn(
            modifyDecisionRoutesModule,
            'modifyDecisionRoutes',
          );
          const checkCanPublishDatasetSpy = jest
            .spyOn(checkCanPublishDatasetModule, 'checkCanPublishDataset')
            .mockReturnValue(undefined);

          const request = createDefaultMockRequest();
          const response = createMock<Response>();
          const flashMock = flashMessage as jest.Mock;
          flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

          await controller.update(
            'example-profession-id',
            'example-organisation-id',
            2016,
            editDto,
            request,
            response,
          );

          expect(checkCanPublishDatasetSpy).toHaveBeenCalledWith(request);

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/decisions/example-profession-id/example-organisation-id/2016/publish?fromEdit=true',
          );

          expect(professionsService.findWithVersions).toHaveBeenCalledWith(
            'example-profession-id',
          );
          expect(organisationsService.find).toHaveBeenCalledWith(
            'example-organisation-id',
          );
          expect(decisionDatasetsService.find).toHaveBeenCalledWith(
            'example-profession-id',
            'example-organisation-id',
            2016,
          );

          expect(decisionDatasetsService.save).toHaveBeenCalledWith({
            profession,
            organisation,
            year: 2016,
            user,
            status: DecisionDatasetStatus.Draft,
            routes: decisionRoutes,
          } as DecisionDataset);

          expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
            request,
            profession,
            organisation,
            2016,
            false,
          );
          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(parseEditDtoDecisionRoutesSpy).toHaveBeenCalledWith(editDto);
          expect(modifyDecisionRoutesSpy).not.toHaveBeenCalled();
        });
      });

      describe('when the `action` is "submit"', () => {
        it('saves the given dataset as draft and redirects to the submission confirmation page', async () => {
          const editDto: EditDto = {
            routes: ['Example route'],
            countries: [['Brazil']],
            yeses: [['1']],
            noes: [['5']],
            yesAfterComps: [['4']],
            noAfterComps: [['7']],
            noOtherConditions: [['2']],
            action: 'submit',
          };

          const decisionRoutes: DecisionRoute[] = [
            {
              name: 'Example route',
              countries: [
                {
                  code: 'BR',
                  decisions: {
                    yes: 1,
                    no: 5,
                    yesAfterComp: 5,
                    noAfterComp: 7,
                    noOtherConditions: 3,
                  },
                },
              ],
            },
          ];

          const profession = professionFactory.build({
            id: 'example-profession-id',
          });

          const organisation = organisationFactory.build({
            id: 'example-organisation-id',
          });

          const user = userFactory.build();

          professionsService.findWithVersions.mockResolvedValue(profession);
          organisationsService.find.mockResolvedValue(organisation);
          decisionDatasetsService.find.mockResolvedValue(undefined);

          const checkCanChangeDatasetSpy = jest
            .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
            .mockImplementation();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);

          const parseEditDtoDecisionRoutesSpy = jest
            .spyOn(
              parseEditDtoDecisionRoutesModule,
              'parseEditDtoDecisionRoutes',
            )
            .mockReturnValue(decisionRoutes);
          const modifyDecisionRoutesSpy = jest.spyOn(
            modifyDecisionRoutesModule,
            'modifyDecisionRoutes',
          );

          const request = createDefaultMockRequest();
          const response = createMock<Response>();
          const flashMock = flashMessage as jest.Mock;
          flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

          await controller.update(
            'example-profession-id',
            'example-organisation-id',
            2016,
            editDto,
            request,
            response,
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/decisions/example-profession-id/example-organisation-id/2016/submit?fromEdit=true',
          );

          expect(professionsService.findWithVersions).toHaveBeenCalledWith(
            'example-profession-id',
          );
          expect(organisationsService.find).toHaveBeenCalledWith(
            'example-organisation-id',
          );
          expect(decisionDatasetsService.find).toHaveBeenCalledWith(
            'example-profession-id',
            'example-organisation-id',
            2016,
          );

          expect(decisionDatasetsService.save).toHaveBeenCalledWith({
            profession,
            organisation,
            year: 2016,
            user,
            status: DecisionDatasetStatus.Draft,
            routes: decisionRoutes,
          } as DecisionDataset);

          expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
            request,
            profession,
            organisation,
            2016,
            false,
          );
          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(parseEditDtoDecisionRoutesSpy).toHaveBeenCalledWith(editDto);
          expect(modifyDecisionRoutesSpy).not.toHaveBeenCalled();
        });
      });

      describe('when the `action` is "save"', () => {
        it('saves the given dataset with the draft status', async () => {
          const editDto: EditDto = {
            routes: ['Example route'],
            countries: [['Germany']],
            yeses: [['1']],
            noes: [['8']],
            yesAfterComps: [['1']],
            noAfterComps: [['2']],
            noOtherConditions: [['4']],
            action: 'save',
          };

          const decisionRoutes: DecisionRoute[] = [
            {
              name: 'Example route',
              countries: [
                {
                  code: 'DE',
                  decisions: {
                    yes: 1,
                    no: 8,
                    yesAfterComp: 1,
                    noAfterComp: 2,
                    noOtherConditions: 3,
                  },
                },
              ],
            },
          ];

          const profession = professionFactory.build({
            id: 'example-profession-id',
          });

          const organisation = organisationFactory.build({
            id: 'example-organisation-id',
          });

          const user = userFactory.build();

          professionsService.findWithVersions.mockResolvedValue(profession);
          organisationsService.find.mockResolvedValue(organisation);
          decisionDatasetsService.find.mockResolvedValue(undefined);

          const checkCanChangeDatasetSpy = jest
            .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
            .mockImplementation();

          const getActingUserSpy = jest
            .spyOn(getActingUserModule, 'getActingUser')
            .mockReturnValue(user);

          const parseEditDtoDecisionRoutesSpy = jest
            .spyOn(
              parseEditDtoDecisionRoutesModule,
              'parseEditDtoDecisionRoutes',
            )
            .mockReturnValue(decisionRoutes);
          const modifyDecisionRoutesSpy = jest.spyOn(
            modifyDecisionRoutesModule,
            'modifyDecisionRoutes',
          );

          const request = createDefaultMockRequest();
          const response = createMock<Response>();

          const flashMock = flashMessage as jest.Mock;
          flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

          await controller.update(
            'example-profession-id',
            'example-organisation-id',
            2016,
            editDto,
            request,
            response,
          );

          expect(flashMock).toHaveBeenCalledWith(
            translationOf('decisions.admin.saveAsDraft.confirmation.heading'),
            translationOf('decisions.admin.saveAsDraft.confirmation.body'),
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/decisions/example-profession-id/example-organisation-id/2016',
          );

          expect(professionsService.findWithVersions).toHaveBeenCalledWith(
            'example-profession-id',
          );
          expect(organisationsService.find).toHaveBeenCalledWith(
            'example-organisation-id',
          );
          expect(decisionDatasetsService.find).toHaveBeenCalledWith(
            'example-profession-id',
            'example-organisation-id',
            2016,
          );

          expect(decisionDatasetsService.save).toHaveBeenCalledWith({
            profession,
            organisation,
            year: 2016,
            user,
            status: DecisionDatasetStatus.Draft,
            routes: decisionRoutes,
          } as DecisionDataset);

          expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
            request,
            profession,
            organisation,
            2016,
            false,
          );
          expect(getActingUserSpy).toHaveBeenCalledWith(request);
          expect(parseEditDtoDecisionRoutesSpy).toHaveBeenCalledWith(editDto);
          expect(modifyDecisionRoutesSpy).not.toHaveBeenCalled();
        });
      });

      describe('when the `action` is a modification command', () => {
        it('does not validate the data, but modifies the dataset', async () => {
          const editDto: EditDto = {
            routes: ['Example route'],
            countries: [['Japan']],
            yeses: [['4']],
            noes: [['5']],
            yesAfterComps: [['']],
            noAfterComps: [['9']],
            noOtherConditions: [['2']],
            action: 'addCountry:1',
          };

          const decisionRoutes: DecisionRoute[] = [
            {
              name: 'Example route',
              countries: [
                {
                  code: 'JP',
                  decisions: {
                    yes: 4,
                    no: 5,
                    yesAfterComp: null,
                    noAfterComp: 9,
                    noOtherConditions: 3,
                  },
                },
              ],
            },
          ];

          const profession = professionFactory.build({
            id: 'example-profession-id',
          });

          const organisation = organisationFactory.build({
            id: 'example-organisation-id',
          });

          professionsService.findWithVersions.mockResolvedValue(profession);
          organisationsService.find.mockResolvedValue(organisation);
          decisionDatasetsService.find.mockResolvedValue(undefined);

          (
            DecisionDatasetEditPresenter.prototype.present as jest.Mock
          ).mockReturnValue(mockRouteTemplates);

          const checkCanChangeDatasetSpy = jest
            .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
            .mockImplementation();

          const parseEditDtoDecisionRoutesSpy = jest
            .spyOn(
              parseEditDtoDecisionRoutesModule,
              'parseEditDtoDecisionRoutes',
            )
            .mockReturnValue(decisionRoutes);
          const modifyDecisionRoutesSpy = jest
            .spyOn(modifyDecisionRoutesModule, 'modifyDecisionRoutes')
            .mockImplementation();

          const request = createDefaultMockRequest();
          const response = createMock<Response>();

          await controller.update(
            'example-profession-id',
            'example-organisation-id',
            2017,
            editDto,
            request,
            response,
          );

          expect(response.render).toHaveBeenCalledWith('admin/decisions/edit', {
            profession,
            organisation,
            year: 2017,
            routes: mockRouteTemplates,
          } as EditTemplate);

          expect(professionsService.findWithVersions).toHaveBeenCalledWith(
            'example-profession-id',
          );
          expect(organisationsService.find).toHaveBeenCalledWith(
            'example-organisation-id',
          );
          expect(decisionDatasetsService.find).toHaveBeenCalledWith(
            'example-profession-id',
            'example-organisation-id',
            2017,
          );

          expect(DecisionDatasetEditPresenter).toHaveBeenCalledWith(
            decisionRoutes,
            i18nService,
          );
          expect(
            DecisionDatasetEditPresenter.prototype.present,
          ).toHaveBeenCalled();

          expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
            request,
            profession,
            organisation,
            2017,
            false,
          );
          expect(parseEditDtoDecisionRoutesSpy).toHaveBeenCalledWith(editDto);
          expect(modifyDecisionRoutesSpy).toHaveBeenCalledWith(
            decisionRoutes,
            'addCountry:1',
          );
        });
      });
    });

    describe('when submitting invalid data', () => {
      describe.each(['publish', 'save', 'submit'])(
        'when the action is %s',
        (action) => {
          it('re-renders the view with errors, not saving the entry', async () => {
            const editDtoWithEmptyRoutes: EditDto = {
              routes: ['', 'Route 2', ''],
              countries: [['CA'], ['AR'], ['JP']],
              yeses: [['1'], ['1'], ['1']],
              yesAfterComps: [['1'], ['1'], ['1']],
              noes: [['1'], ['1'], ['1']],
              noAfterComps: [['1'], ['1'], ['1']],
              noOtherConditions: [['1'], ['1'], ['1']],
              action,
            };

            const decisionRoutes: DecisionRoute[] = [
              {
                name: 'Example route',
                countries: [
                  {
                    code: 'JP',
                    decisions: {
                      yes: 4,
                      no: 5,
                      yesAfterComp: null,
                      noAfterComp: 9,
                      noOtherConditions: 9,
                    },
                  },
                ],
              },
            ];

            const profession = professionFactory.build({
              id: 'example-profession-id',
            });

            const organisation = organisationFactory.build({
              id: 'example-organisation-id',
            });

            professionsService.findWithVersions.mockResolvedValue(profession);
            organisationsService.find.mockResolvedValue(organisation);
            decisionDatasetsService.find.mockResolvedValue(undefined);

            (
              DecisionDatasetEditPresenter.prototype.present as jest.Mock
            ).mockReturnValue(mockRouteTemplates);

            const checkCanChangeDatasetSpy = jest
              .spyOn(checkCanChangeDatasetModule, 'checkCanChangeDataset')
              .mockImplementation();

            const parseEditDtoDecisionRoutesSpy = jest
              .spyOn(
                parseEditDtoDecisionRoutesModule,
                'parseEditDtoDecisionRoutes',
              )
              .mockReturnValue(decisionRoutes);

            jest
              .spyOn(checkCanPublishDatasetModule, 'checkCanPublishDataset')
              .mockReturnValue(undefined);

            const request = createDefaultMockRequest();
            const response = createMock<Response>();

            await controller.update(
              'example-profession-id',
              'example-organisation-id',
              2017,
              editDtoWithEmptyRoutes,
              request,
              response,
            );

            expect(response.render).toHaveBeenCalledWith(
              'admin/decisions/edit',
              {
                profession,
                organisation,
                year: 2017,
                routes: mockRouteTemplates,
                errors: {
                  'routes[1]': {
                    text: 'decisions.admin.edit.errors.routes.empty',
                  },
                  'routes[3]': {
                    text: 'decisions.admin.edit.errors.routes.empty',
                  },
                },
              } as EditTemplate,
            );

            expect(professionsService.findWithVersions).toHaveBeenCalledWith(
              'example-profession-id',
            );
            expect(organisationsService.find).toHaveBeenCalledWith(
              'example-organisation-id',
            );
            expect(decisionDatasetsService.find).toHaveBeenCalledWith(
              'example-profession-id',
              'example-organisation-id',
              2017,
            );

            expect(checkCanChangeDatasetSpy).toHaveBeenCalledWith(
              request,
              profession,
              organisation,
              2017,
              false,
            );
            expect(parseEditDtoDecisionRoutesSpy).toHaveBeenCalledWith(
              editDtoWithEmptyRoutes,
            );

            expect(decisionDatasetsService.save).not.toHaveBeenCalled();
          });
        },
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});
