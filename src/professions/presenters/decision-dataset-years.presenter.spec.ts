import { SummaryList } from '../../common/interfaces/summary-list';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import professionFactory from '../../testutils/factories/profession';
import { translationOf } from '../../testutils/translation-of';
import { DecisionDatasetYearsPresenter } from './decision-dataset-years.presenter';

describe('DecisionDatasetYearsPresenter', () => {
  describe('summaryList', () => {
    it('returns a SummaryList of the given years', () => {
      const years = [2025, 2022, 2021];

      const profession = professionFactory.build({
        slug: 'example-slug',
      });

      const i18nService = createMockI18nService();

      const presenter = new DecisionDatasetYearsPresenter(
        years,
        profession,
        i18nService,
      );

      const result = presenter.summaryList();

      expect(result).toEqual({
        classes: 'govuk-summary-list--no-border',
        rows: [
          {
            key: {
              text: translationOf('professions.show.decisions.year'),
            },
            value: {
              html: '<a href="/decisions/example-slug/2025" class="govuk-link">2025</a>',
            },
          },
          {
            key: {
              text: translationOf('professions.show.decisions.year'),
            },
            value: {
              html: '<a href="/decisions/example-slug/2022" class="govuk-link">2022</a>',
            },
          },
          {
            key: {
              text: translationOf('professions.show.decisions.year'),
            },
            value: {
              html: '<a href="/decisions/example-slug/2021" class="govuk-link">2021</a>',
            },
          },
        ],
      } as SummaryList);
    });
  });
});
