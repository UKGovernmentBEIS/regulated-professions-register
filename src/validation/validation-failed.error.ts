import { ValidationError } from 'class-validator';

/**
 * Defines an exception for validations errors.
 *
 * This extends the base `Error` class, and adds an array
 * of `ValidationError`s to the constructor. This allows
 * us to keep a reference to the errors, and the target
 * as well as a marshalled version of the messages, that
 * we can easily use in views.
 *
 */
export class ValidationFailedError extends Error {
  validationErrors: ValidationError[];
  target: any;

  /**
   * Instantiate a `ValidationFailedError` exception
   *
   * @example
   *
   * `throw new ValidationFailedError(validationErrors)`
   *
   * @param validationErrors An array of `ValidationError`s
   */
  constructor(validationErrors: ValidationError[]) {
    super();
    this.validationErrors = validationErrors;
    this.target = validationErrors[0].target;
  }

  /*
   * Returns errors in a way we can use in views
   *
   * This mirrors the way errors are used in the GOV.UK Design
   * System Nunjucks templates
   * (see https://design-system.service.gov.uk/components/text-input/)
   *
   * @returns An array of objects mapped against each error's property
   *
   */
  public fullMessages(): object {
    return this.validationErrors.reduce((map, error) => {
      map[error.property] = {
        text: Object.values(error.constraints).join(),
      };
      return map;
    }, {});
  }
}
