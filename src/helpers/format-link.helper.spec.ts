import { isURL } from 'class-validator';
import { escapeOf } from '../testutils/escape-of';
import { escape } from './escape.helper';
import { formatLink } from './format-link.helper';
import { preprocessUrl } from './preprocess-url.helper';

jest.mock('./escape.helper');
jest.mock('./preprocess-url.helper');
jest.mock('class-validator');

describe('formatLink', () => {
  describe('when given a URL', () => {
    it('returns the URL wrapped in link tags', () => {
      (preprocessUrl as jest.Mock).mockImplementation(preprocessUrlOf);
      (escape as jest.Mock).mockImplementation(escapeOf);
      (isURL as jest.Mock).mockReturnValue(true);

      const result = formatLink('http://www.example.com');

      const presentedUrl = escapeOf(preprocessUrlOf('http://www.example.com'));

      expect(result).toEqual(
        `<a href="${presentedUrl}" class="govuk-link">${presentedUrl}</a>`,
      );
    });
  });

  describe('when given a non-URL', () => {
    it('returns the escaped input string', () => {
      (preprocessUrl as jest.Mock).mockImplementation(preprocessUrlOf);
      (escape as jest.Mock).mockImplementation(escapeOf);
      (isURL as jest.Mock).mockReturnValue(false);

      const result = formatLink('not a url');

      expect(result).toEqual(escapeOf('not a url'));
    });
  });

  describe('when given `null`', () => {
    it('returns an empty string', () => {
      expect(formatLink(null)).toEqual('');
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

export function preprocessUrlOf(text: string): string {
  return `Preprocessed URL of '${text}'`;
}
