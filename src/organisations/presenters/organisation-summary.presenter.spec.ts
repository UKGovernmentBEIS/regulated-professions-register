import { I18nService } from 'nestjs-i18n';
import { SummaryList } from '../../common/interfaces/summary-list';
import { ProfessionPresenter } from '../../professions/presenters/profession.presenter';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import organisationFactory from '../../testutils/factories/organisation';
import professionsFactory from '../../testutils/factories/profession';
import { Organisation } from '../organisation.entity';
import { OrganisationSummaryPresenter } from './organisation-summary.presenter';
import { OrganisationPresenter } from './organisation.presenter';

const mockSummaryList = (): SummaryList => {
  return {
    classes: 'govuk-summary-list--no-border',
    rows: [],
  };
};

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
      let organisation: Organisation;

      beforeEach(() => {
        organisation = organisationFactory.build({
          professions: professionsFactory.buildList(2),
        });
      });

      it("should return tempalate variables contraining an organisation's summary", async () => {
        const presenter = new OrganisationSummaryPresenter(
          organisation,
          'back-link',
          i18nService,
        );

        expect(await presenter.present()).toEqual({
          backLink: 'back-link',
          organisation: organisation,
          summaryList: mockSummaryList(),
          professions: [
            {
              name: organisation.professions[0].name,
              slug: organisation.professions[0].slug,
              summaryList: mockSummaryList(),
            },
            {
              name: organisation.professions[1].name,
              slug: organisation.professions[1].slug,
              summaryList: mockSummaryList(),
            },
          ],
        });

        expect(OrganisationPresenter).toHaveBeenCalledWith(
          organisation,
          i18nService,
        );

        expect(ProfessionPresenter).toHaveBeenCalledWith(
          organisation.professions[0],
          i18nService,
        );

        expect(ProfessionPresenter).toHaveBeenCalledWith(
          organisation.professions[1],
          i18nService,
        );
      });
    });

    describe('when the professions relation is not present on the organisation', () => {
      let organisation: Organisation;

      beforeEach(() => {
        organisation = organisationFactory.build({
          professions: undefined,
        });
      });

      it('should raise an error', async () => {
        const presenter = new OrganisationSummaryPresenter(
          organisation,
          'back-link',
          i18nService,
        );
        expect(async () => {
          await presenter.present();
        }).rejects.toThrowError(
          'You must eagerly load professions to show professions. Try calling a "WithProfessions" method on the `OrganisationsService` class',
        );
      });
    });
  });
});
