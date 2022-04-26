import { YearsCheckboxPresenter } from './years-checkbox.presenter';

describe('YearsCheckboxPresenter', () => {
  describe('checkboxItems', () => {
    describe('when called with an empty list of years', () => {
      it('should return unchecked checkbox arguments', async () => {
        const presenter = new YearsCheckboxPresenter(2020, 2023, []);

        await expect(presenter.checkboxItems()).toEqual([
          {
            text: '2020',
            value: '2020',
            checked: false,
          },
          {
            text: '2021',
            value: '2021',
            checked: false,
          },
          {
            text: '2022',
            value: '2022',
            checked: false,
          },
          {
            text: '2023',
            value: '2023',
            checked: false,
          },
        ]);
      });
    });

    describe('when called with a non-empty list of years', () => {
      it('should return some checked checkbox arguments', async () => {
        const presenter = new YearsCheckboxPresenter(2020, 2023, [2021, 2022]);

        await expect(presenter.checkboxItems()).toEqual([
          {
            text: '2020',
            value: '2020',
            checked: false,
          },
          {
            text: '2021',
            value: '2021',
            checked: true,
          },
          {
            text: '2022',
            value: '2022',
            checked: true,
          },
          {
            text: '2023',
            value: '2023',
            checked: false,
          },
        ]);
      });
    });
  });
});
