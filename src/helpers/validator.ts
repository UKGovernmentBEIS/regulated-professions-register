import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class Validator<T extends object> {
  obj: T;
  dtoType: any;
  errors: ValidationError[];

  public static async validate<T extends object>(
    dtoType: { new (): T },
    obj: object,
  ) {
    const object: T = plainToClass(dtoType, obj);
    const errors = await validate(object);

    return new Validator<T>(dtoType, object, errors);
  }

  constructor(dtoType: any, obj: T, errors: ValidationError[]) {
    this.obj = obj;
    this.dtoType = dtoType;
    this.errors = errors;
  }

  public valid?() {
    return this.errors.length == 0;
  }
}
