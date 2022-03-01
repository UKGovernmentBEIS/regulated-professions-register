import { isEmail } from 'class-validator';
import { escapeOf } from '../testutils/escape-of';
import { escape } from './escape.helper';
import { formatEmail } from './format-email.helper';
import { preprocessEmail } from './preprocess-email.helper';

jest.mock('./escape.helper');
jest.mock('./preprocess-email.helper');
jest.mock('class-validator');

describe('formatEmail', () => {
  describe('when given an email address', () => {
    it('returns the email address wrapped in link tags', () => {
      (preprocessEmail as jest.Mock).mockImplementation(preprocessEmailOf);
      (escape as jest.Mock).mockImplementation(escapeOf);
      (isEmail as jest.Mock).mockReturnValue(true);

      const result = formatEmail('name@example.com');

      const presentedEmail = escapeOf(preprocessEmailOf('name@example.com'));

      expect(result).toEqual(
        `<a href="mailto:${presentedEmail}" class="govuk-link">${presentedEmail}</a>`,
      );
    });
  });

  describe('when given a non-email address', () => {
    it('returns the escaped input string', () => {
      (preprocessEmail as jest.Mock).mockImplementation(preprocessEmailOf);
      (escape as jest.Mock).mockImplementation(escapeOf);
      (isEmail as jest.Mock).mockReturnValue(false);

      const result = formatEmail('not an email address');

      expect(result).toEqual(escapeOf('not an email address'));
    });
  });

  describe('when given `null`', () => {
    it('returns an empty string', () => {
      expect(formatEmail(null)).toEqual('');
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});

export function preprocessEmailOf(text: string): string {
  return `Preprocessed email address of '${text}'`;
}
