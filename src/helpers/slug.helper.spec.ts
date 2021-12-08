import { generateSlug } from './slug.helper';

describe('generateSlug', () => {
  it('should generate a URL-safe slug', () => {
    const result = generateSlug('Example String');

    expect(result).toEqual('example-string');
  });

  it('should truncate long strings to 100 characters', () => {
    const result = generateSlug(
      'A Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Long Name',
    );

    expect(result).toEqual(
      'a-very-very-very-very-very-very-very-very-very-very-very-very-very-very-very-very-very-very-very-ver',
    );
  });

  it('should remove non-alphanumeric characters', () => {
    const result = generateSlug('👻 Department 😜 of 🥸 Emoji 🙀');

    expect(result).toEqual('department-of-emoji');
  });
});
