import { Nation } from './nation';

describe(Nation, () => {
  describe('.all', () => {
    it('returns all nations in the Nations config file', () => {
      expect(Nation.all()).toEqual([
        new Nation('nations.england', 'GB-ENG'),
        new Nation('nations.northernIreland', 'GB-NIR'),
        new Nation('nations.scotland', 'GB-SCT'),
        new Nation('nations.wales', 'GB-WLS'),
      ]);
    });
  });

  describe('.find', () => {
    describe('when a Nation exists with the requested code in the Nations config', () => {
      it('returns that Nation', () => {
        expect(Nation.find('GB-ENG')).toEqual(
          new Nation('nations.england', 'GB-ENG'),
        );
      });
    });

    describe('when a Nation with the requested code does not exist in the Nations config', () => {
      it('throws an error', () => {
        expect(() => {
          Nation.find('nothing');
        }).toThrow('Could not find requested Nation');
      });
    });
  });
});
