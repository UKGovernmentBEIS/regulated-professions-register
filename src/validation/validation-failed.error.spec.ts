import { ValidationFailedError } from './validation-failed.error';
import { ValidationError } from 'class-validator';

class StubClass {}

describe('ValidationFailedError', () => {
  let validationErrors: ValidationError[];
  let validationFailedError: ValidationFailedError;
  let target: StubClass;

  beforeEach(() => {
    target = new StubClass();
    validationErrors = [
      {
        target: target,
        property: 'title',
        value: 'Hello',
        constraints: {
          length: 'must be longer than or equal to 10 characters',
        },
      },
      {
        target: new StubClass(),
        property: 'description',
        value: '',
        constraints: {
          length: 'must not be blank',
        },
      },
    ];
    validationFailedError = new ValidationFailedError(validationErrors);
  });

  it('should store a reference to the validation errors', () => {
    expect(validationFailedError.validationErrors).toEqual(validationErrors);
  });

  it('should store a reference to the target', () => {
    expect(validationFailedError.target).toEqual(target);
  });

  it('should marshal the validation errors into a simple object', () => {
    expect(validationFailedError.fullMessages()).toEqual({
      title: {
        text: 'must be longer than or equal to 10 characters',
      },
      description: {
        text: 'must not be blank',
      },
    });
  });
});
