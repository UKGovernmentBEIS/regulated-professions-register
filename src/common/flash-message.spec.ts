import { escape } from '../helpers/escape.helper';
import { escapeOf } from '../testutils/escape-of';
import { flashMessage } from './flash-message';

jest.mock('../helpers/escape.helper');

describe('flashMessage', () => {
  describe('when a body and title are provided', () => {
    it('returns the html with a body and title', () => {
      (escape as jest.Mock).mockImplementation(escapeOf);
      const response = flashMessage('Title', 'Body');

      expect(response).toMatch(
        `<h3 class="govuk-notification-banner__heading">${escapeOf(
          'Title',
        )}</h3>`,
      );

      expect(response).toMatch(`<p class="govuk-body">${escapeOf('Body')}</p>`);
    });
  });

  describe('when the title is provided', () => {
    it('only returns the title', () => {
      (escape as jest.Mock).mockImplementation(escapeOf);
      const response = flashMessage('Title');

      expect(response).toMatch(
        `<h3 class="govuk-notification-banner__heading">${escapeOf(
          'Title',
        )}</h3>`,
      );

      expect(response).not.toMatch('<p class="govuk-body">');
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
