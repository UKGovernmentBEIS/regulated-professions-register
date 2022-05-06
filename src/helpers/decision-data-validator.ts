import { ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { EditDto } from '../decisions/admin/dto/edit.dto';

export class DecisionDataValidator {
  obj: EditDto;
  errors: ValidationError[];

  public static validate(obj: EditDto) {
    const object: EditDto = plainToClass(EditDto, obj);
    const errors = this.validateNoEmptyRoutes(obj);

    return new DecisionDataValidator(object, errors);
  }

  constructor(obj: EditDto, errors: ValidationError[]) {
    this.obj = obj;
    this.errors = errors;
  }

  public valid?() {
    return this.errors.length == 0;
  }

  public static validateNoEmptyRoutes(editDto: EditDto): ValidationError[] {
    return editDto.routes
      .map((route, index) => {
        if (route.trim() === '') {
          return {
            // indexes in the template are not zero indexed, so we add 1 here
            property: `routes[${index + 1}]`,
            constraints: {
              message: 'decisions.admin.edit.errors.routes.empty',
            },
          };
        }
      })
      .filter((n) => n);
  }
}
