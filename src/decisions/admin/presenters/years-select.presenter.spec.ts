import { SelectItemArgs } from '../../../common/interfaces/select-item-args.interface';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import { translationOf } from '../../../testutils/translation-of';
import { YearsSelectPresenter } from './years-select.presenter';

describe('YearsSelectPresenter', () => {
  describe('selectArgs', () => {
    describe('when given a null selected year', () => {
      it('returns a list of years, with no year selected', () => {
        const presenter = new YearsSelectPresenter(
          2016,
          2020,
          null,
          createMockI18nService(),
        );

        const expected: SelectItemArgs[] = [
          {
            text: translationOf('app.pleaseSelect'),
            value: '',
            selected: null,
          },
          {
            text: '2016',
            value: '2016',
            selected: false,
          },
          {
            text: '2017',
            value: '2017',
            selected: false,
          },
          {
            text: '2018',
            value: '2018',
            selected: false,
          },
          {
            text: '2019',
            value: '2019',
            selected: false,
          },
          {
            text: '2020',
            value: '2020',
            selected: false,
          },
        ];

        expect(presenter.selectArgs()).toEqual(expected);
      });
    });

    describe('when given a non-null selected year', () => {
      it('returns a list of years, with the given year selected', () => {
        const presenter = new YearsSelectPresenter(
          2016,
          2020,
          2017,
          createMockI18nService(),
        );

        const expected: SelectItemArgs[] = [
          {
            text: translationOf('app.pleaseSelect'),
            value: '',
            selected: null,
          },
          {
            text: '2016',
            value: '2016',
            selected: false,
          },
          {
            text: '2017',
            value: '2017',
            selected: true,
          },
          {
            text: '2018',
            value: '2018',
            selected: false,
          },
          {
            text: '2019',
            value: '2019',
            selected: false,
          },
          {
            text: '2020',
            value: '2020',
            selected: false,
          },
        ];

        expect(presenter.selectArgs()).toEqual(expected);
      });
    });
  });
});
