import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';

export class Validator {
  obj: object;
  dtoType: any;
  errors: ValidationError[];

  public static async validate(dtoType: any, obj: object) {
    const object: object = plainToClass(dtoType, obj);
    const errors = await validate(object);

    return new Validator(dtoType, obj, errors);
  }

  constructor(dtoType: any, obj: object, errors: ValidationError[]) {
    this.obj = obj;
    this.dtoType = dtoType;
    this.errors = errors;
  }

  public valid?() {
    return this.errors.length == 0;
  }
}
