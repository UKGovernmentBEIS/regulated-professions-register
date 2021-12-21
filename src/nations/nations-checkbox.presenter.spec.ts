import { Nation } from './nation';
import { NationsCheckboxPresenter } from './nations-checkbox.presenter';

describe('NationsCheckboxPresenter', () => {
  describe('checkboxArgs', () => {
    it('should return unchecked checkbox arguments when called with one argument', () => {
      const presenter = new NationsCheckboxPresenter(Nation.all());

      expect(presenter.checkboxArgs()).toEqual([
        {
          text: 'nations.england',
          value: 'GB-ENG',
          checked: false,
        },
        {
          text: 'nations.scotland',
          value: 'GB-SCT',
          checked: false,
        },
        {
          text: 'nations.wales',
          value: 'GB-WLS',
          checked: false,
        },
        {
          text: 'nations.northernIreland',
          value: 'GB-NIR',
          checked: false,
        },
      ]);
    });

    it('should return some checked checkbox arguments when called with two arguments', () => {
      const nations = Nation.all();
      const presenter = new NationsCheckboxPresenter(nations, [
        nations[0],
        nations[2],
      ]);

      expect(presenter.checkboxArgs()).toEqual([
        {
          text: 'nations.england',
          value: 'GB-ENG',
          checked: true,
        },
        {
          text: 'nations.scotland',
          value: 'GB-SCT',
          checked: false,
        },
        {
          text: 'nations.wales',
          value: 'GB-WLS',
          checked: true,
        },
        {
          text: 'nations.northernIreland',
          value: 'GB-NIR',
          checked: false,
        },
      ]);
    });
  });
});
