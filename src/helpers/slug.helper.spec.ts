import { generateSlug } from './slug.helper';

describe('generateSlug', () => {
  it('should generate a URL-safe slug', () => {
    const result = generateSlug('Example String', 0);

    expect(result).toEqual('example-string');
  });

  it('should truncate long strings to 100 characters', () => {
    const result = generateSlug(
      'A Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Very Long Name',
      0,
    );

    expect(result).toEqual(
      'a-very-very-very-very-very-very-very-very-very-very-very-very-very-very-very-very-very-very-very-ver',
    );
  });

  it('should remove non-alphanumeric characters', () => {
    const result = generateSlug('👻 Department 😜 of 🥸 Emoji 🙀', 0);

    expect(result).toEqual('department-of-emoji');
  });

  it('should append the attempt number where `retryCount` is non-zero', () => {
    const retryOne = generateSlug('Example String', 1);
    const retryLarge = generateSlug('Example String', 53786);

    expect(retryOne).toEqual('example-string-1');
    expect(retryLarge).toEqual('example-string-53786');
  });
});
