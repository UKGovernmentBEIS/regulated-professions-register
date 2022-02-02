import { flashMessage } from './flash-message';

describe('flashMessage', () => {
  describe('when a body and title are provided', () => {
    it('returns the html with a body and title', () => {
      const response = flashMessage('Title', 'Body');

      expect(response).toMatch(
        '<h3 class="govuk-notification-banner__heading">Title</h3>',
      );

      expect(response).toMatch('<p class="govuk-body">Body</p>');
    });
  });

  describe('when the title is provided', () => {
    it('only returns the title', () => {
      const response = flashMessage('Title');

      expect(response).toMatch(
        '<h3 class="govuk-notification-banner__heading">Title</h3>',
      );

      expect(response).not.toMatch('<p class="govuk-body">');
    });
  });
});
