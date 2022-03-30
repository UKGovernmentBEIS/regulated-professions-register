import { I18nService } from 'nestjs-i18n';
import { SummaryList } from '../../common/interfaces/summary-list';
import { ProfessionPresenter } from '../../professions/presenters/profession.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import organisationFactory from '../../testutils/factories/organisation';
import professionsFactory from '../../testutils/factories/profession';
import { OrganisationSummaryPresenter } from './organisation-summary.presenter';
import { OrganisationPresenter } from './organisation.presenter';

const mockSummaryList = jest.fn((): SummaryList => {
  return {
    classes: 'govuk-summary-list--no-border',
    rows: [],
  };
});

jest.mock('../presenters/organisation.presenter', () => {
  return {
    OrganisationPresenter: jest.fn().mockImplementation(() => {
      return {
        summaryList: mockSummaryList,
      };
    }),
  };
});

jest.mock('../../professions/presenters/profession.presenter', () => {
  return {
    ProfessionPresenter: jest.fn().mockImplementation((profession) => {
      return {
        profession: profession,
        summaryList: mockSummaryList,
      };
    }),
  };
});

describe('OrganisationSummaryPresenter', () => {
  let i18nService: I18nService;

  beforeEach(() => {
    i18nService = createMockI18nService({});
  });

  describe('present', () => {
    describe('when all relations are present on the organisation', () => {
      describe('when `showEmptyFields` is true', () => {
        it("should return template variables contraining an organisation's summary, with blank fields preserved", async () => {
          const organisation = organisationFactory.build();

          const professions = [
            professionsFactory.build({
              slug: 'slug-1',
            }),
            professionsFactory.build({
              slug: 'slug-2',
            }),
            professionsFactory.build({
              slug: null,
            }),
          ];

          const presenter = new OrganisationSummaryPresenter(
            organisation,
            professions,
            i18nService,
          );

          const organisationPresenter = new OrganisationPresenter(
            organisation,
            i18nService,
          );

          expect(await presenter.present(true)).toEqual({
            organisation: organisation,
            presenter: organisationPresenter,
            summaryList: mockSummaryList(),
            professions: [
              {
                name: professions[0].name,
                id: professions[0].id,
                versionId: professions[0].versionId,
                slug: professions[0].slug,
                summaryList: mockSummaryList(),
              },
              {
                name: professions[1].name,
                id: professions[1].id,
                versionId: professions[1].versionId,
                slug: professions[1].slug,
                summaryList: mockSummaryList(),
              },
            ],
          });

          expect(mockSummaryList).toHaveBeenCalledWith({ removeBlank: false });

          expect(OrganisationPresenter).toHaveBeenNthCalledWith(
            2,
            organisation,
            i18nService,
          );

          expect(ProfessionPresenter).toHaveBeenCalledWith(
            professions[0],
            i18nService,
          );

          expect(ProfessionPresenter).toHaveBeenCalledWith(
            professions[1],
            i18nService,
          );
        });
      });

      describe('when `showEmptyFields` is false', () => {
        it("should return template variables contraining an organisation's summary, with blank fields removed", async () => {
          const organisation = organisationFactory.build({});

          const professions = [
            professionsFactory.build({
              slug: 'slug-1',
            }),
            professionsFactory.build({
              slug: 'slug-2',
            }),
            professionsFactory.build({
              slug: null,
            }),
          ];

          const presenter = new OrganisationSummaryPresenter(
            organisation,
            professions,
            i18nService,
          );

          const organisationPresenter = new OrganisationPresenter(
            organisation,
            i18nService,
          );

          expect(await presenter.present(false)).toEqual({
            organisation: organisation,
            presenter: organisationPresenter,
            summaryList: mockSummaryList(),
            professions: [
              {
                name: professions[0].name,
                id: professions[0].id,
                versionId: professions[0].versionId,
                slug: professions[0].slug,
                summaryList: mockSummaryList(),
              },
              {
                name: professions[1].name,
                id: professions[1].id,
                versionId: professions[1].versionId,
                slug: professions[1].slug,
                summaryList: mockSummaryList(),
              },
            ],
          });

          expect(mockSummaryList).toHaveBeenCalledWith({ removeBlank: true });

          expect(OrganisationPresenter).toHaveBeenNthCalledWith(
            2,
            organisation,
            i18nService,
          );

          expect(ProfessionPresenter).toHaveBeenCalledWith(
            professions[0],
            i18nService,
          );

          expect(ProfessionPresenter).toHaveBeenCalledWith(
            professions[1],
            i18nService,
          );
        });
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
