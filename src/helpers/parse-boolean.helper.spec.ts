import { parseBoolean } from './parse-boolean.helper';

describe('parseBoolean', () => {
  it('parses `true` as `true`', () => {
    expect(parseBoolean(true)).toEqual(true);
  });

  it("parses `'true'` as `true`", () => {
    expect(parseBoolean('true')).toEqual(true);
  });

  it('parses `false` as `false`', () => {
    expect(parseBoolean(false)).toEqual(false);
  });

  it("parses `'false'` as `false`", () => {
    expect(parseBoolean('false')).toEqual(false);
  });

  it('parses `undefined` as `false`', () => {
    expect(parseBoolean(undefined)).toEqual(false);
  });

  it('parses an arbitrary string as `false`', () => {
    expect(parseBoolean('not a boolean')).toEqual(false);
  });

  it('parses an empty string as `false`', () => {
    expect(parseBoolean('not a boolean')).toEqual(false);
  });
});
