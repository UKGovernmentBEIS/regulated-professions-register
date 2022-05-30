import { ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { EditDto } from '../decisions/admin/dto/edit.dto';

export class DecisionDataValidator {
  obj: EditDto;
  errors: ValidationError[];

  public static validate(obj: EditDto) {
    const object: EditDto = plainToClass(EditDto, obj);
    const errors = [
      this.validateNoEmptyRoutes(obj),
      this.validateNoDuplicateRoutes(obj),
      this.validateNoEmptyCountries(obj),
    ].flat();

    return new DecisionDataValidator(object, errors);
  }

  constructor(obj: EditDto, errors: ValidationError[]) {
    this.obj = obj;
    this.errors = errors;
  }

  public valid?() {
    return this.errors.length == 0;
  }

  private static validateNoEmptyRoutes(editDto: EditDto): ValidationError[] {
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

  private static validateNoDuplicateRoutes(
    editDto: EditDto,
  ): ValidationError[] {
    return editDto.routes
      .map((route, index) => {
        if (editDto.routes.indexOf(route) !== index && route !== '') {
          return {
            property: `routes[${index + 1}]`,
            constraints: {
              message: 'decisions.admin.edit.errors.routes.duplicate',
            },
          };
        }
      })
      .filter((n) => n);
  }

  private static validateNoEmptyCountries(editDto: EditDto): ValidationError[] {
    return editDto.countries
      .map((countries, routeIndex) => {
        return countries
          .map((country, countryIndex) => {
            if (!country) {
              return {
                property: `countries[${routeIndex + 1}][${countryIndex + 1}]`,
                constraints: {
                  message: 'decisions.admin.edit.errors.countries.empty',
                },
              };
            }
          })
          .filter((n) => n);
      })
      .flat();
  }
}
