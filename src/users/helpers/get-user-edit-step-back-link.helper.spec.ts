import { getUserEditStepBackLink } from './get-user-edit-step-back-link.helper';

describe('getUserEditStepBackLink', () => {
  describe('when the source is the "show" page', () => {
    it('returns a back link to the "show" page', () => {
      const values = { source: 'show' };

      const result = getUserEditStepBackLink(values, 'example-previous-step');

      expect(result).toEqual('/admin/users/:id');
    });
  });

  describe('when the source is the "check your answers" page', () => {
    it('returns a back link to the "check your answers" page', () => {
      const values = { source: 'confirm' };

      const result = getUserEditStepBackLink(values, 'example-previous-step');

      expect(result).toEqual('/admin/users/:id/confirm');
    });
  });

  describe('when the source is null', () => {
    it('returns a back link to the given previous step', () => {
      const values = { source: null };

      const result = getUserEditStepBackLink(values, 'example-previous-step');

      expect(result).toEqual('example-previous-step');
    });
  });
});
