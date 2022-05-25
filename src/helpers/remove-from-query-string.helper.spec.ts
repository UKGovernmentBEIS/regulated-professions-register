import { removeFromQueryString } from './remove-from-query-string.helper';

describe('removeFromQueryString', () => {
  describe('when given a query string that does not contain the parameter to remove', () => {
    it('returns the unmodified string', () => {
      const queryString = 'keywords=teacher&regulator=department-for-education';

      const result = removeFromQueryString(queryString, 'sortBy');

      expect(result).toEqual(queryString);
    });
  });

  describe('when given a query string that contains the parameter to remove as its first parameter', () => {
    it('removes the given parameter', () => {
      const queryString =
        'sortBy=name&keywords=teacher&regulator=department-for-education';

      const result = removeFromQueryString(queryString, 'sortBy');

      expect(result).toEqual(
        'keywords=teacher&regulator=department-for-education',
      );
    });
  });

  describe('when given a query string that contains the parameter to remove as a middle parameter', () => {
    it('removes the given parameter', () => {
      const queryString =
        'keywords=teacher&sortBy=name&regulator=department-for-education';

      const result = removeFromQueryString(queryString, 'sortBy');

      expect(result).toEqual(
        'keywords=teacher&regulator=department-for-education',
      );
    });
  });

  describe('when given a query string that contains the parameter to remove as its last parameter', () => {
    it('removes the given parameter', () => {
      const queryString =
        'keywords=teacher&regulator=department-for-education&sortBy=name';

      const result = removeFromQueryString(queryString, 'sortBy');

      expect(result).toEqual(
        'keywords=teacher&regulator=department-for-education',
      );
    });
  });
});
