import { escape } from './escape.helper';

describe('escape', () => {
  it('escapes HTML tags', () => {
    expect(escape('<ul class="foo">')).toBe('&lt;ul class=&quot;foo&quot;&gt;');
  });

  it('escapes HTML reserved characters', () => {
    expect(escape('It’s a great day for you & me')).toBe(
      'It’s a great day for you &amp; me',
    );
  });
});
