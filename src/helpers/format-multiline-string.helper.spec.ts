import { escapeOf } from '../testutils/escape-of';
import { escape } from './escape.helper';
import { formatMultilineString } from './format-multiline-string.helper';
jest.mock('./escape.helper');

describe('formatMultilineString', () => {
  describe('when the string is a single line', () => {
    it('wraps the string in a paragraph', () => {
      (escape as jest.Mock).mockImplementation(escapeOf);

      const input = 'example line';
      const expected = `<p class="example-class">${escapeOf(
        'example line',
      )}</p>`;

      expect(formatMultilineString(input, 'example-class')).toEqual(expected);

      expect(escape).toBeCalledTimes(1);
    });
  });

  describe('when the string contains non-consecutive new-lines', () => {
    it('replaces the new-lines with line-break tags', () => {
      (escape as jest.Mock).mockImplementation(escapeOf);

      const input = 'example line 1\nexample line 2\rexample line 3';
      const expected = `<p class="example-class">${escapeOf(
        'example line 1',
      )}<br />${escapeOf('example line 2')}<br />${escapeOf(
        'example line 3',
      )}</p>`;

      expect(formatMultilineString(input, 'example-class')).toEqual(expected);

      expect(escape).toBeCalledTimes(3);
    });
  });

  describe('when the string contains CR LF sequences', () => {
    it('it treats them as a single new-line', () => {
      (escape as jest.Mock).mockImplementation(escapeOf);

      const input = 'example line 1\r\nexample line 2';

      const expected = `<p class="example-class">${escapeOf(
        'example line 1',
      )}<br />${escapeOf('example line 2')}</p>`;

      expect(formatMultilineString(input, 'example-class')).toEqual(expected);

      expect(escape).toBeCalledTimes(2);
    });
  });

  describe('when the string contains consecutive new-lines', () => {
    it('begins an new paragraph', () => {
      (escape as jest.Mock).mockImplementation(escapeOf);

      const input =
        'example paragraph 1\n\nexample paragraph 2\nline 2 paragraph 2';

      const expected = `<p class="example-class">${escapeOf(
        'example paragraph 1',
      )}</p><p class="example-class">${escapeOf(
        'example paragraph 2',
      )}<br />${escapeOf('line 2 paragraph 2')}</p>`;

      expect(formatMultilineString(input, 'example-class')).toEqual(expected);

      expect(escape).toBeCalledTimes(3);
    });
  });

  describe('when the string starts and ends with whitespace', () => {
    it('the whitespace is ignored', () => {
      (escape as jest.Mock).mockImplementation(escapeOf);

      const input =
        '   \n\n \r\n    \nexample paragraph 1\n\nexample paragraph 2\n\n  \r';

      const expected = `<p class="example-class">${escapeOf(
        'example paragraph 1',
      )}</p><p class="example-class">${escapeOf('example paragraph 2')}</p>`;

      expect(formatMultilineString(input, 'example-class')).toEqual(expected);

      expect(escape).toBeCalledTimes(2);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
