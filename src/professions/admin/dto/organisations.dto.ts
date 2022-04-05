import { Transform } from 'class-transformer';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';

export type ProfessionToOrganisationParams = {
  organisation: string;
  role: string;
};

const nonBlankParameters = (
  params: ProfessionToOrganisationParams[],
): ProfessionToOrganisationParams[] => {
  return params.filter(
    (p: ProfessionToOrganisationParams) =>
      p.organisation !== '' || p.role !== '',
  );
};

@ValidatorConstraint()
class ProfessionToOrganisationMustHaveRole
  implements ValidatorConstraintInterface
{
  validate(params: ProfessionToOrganisationParams[]) {
    if (nonBlankParameters(params).length) {
      return nonBlankParameters(params).every(
        (p: ProfessionToOrganisationParams) => p.role,
      );
    } else {
      // If the array is blank, we return true, because `ProfessionToOrganisationNotBlank`
      // will have been raised, and we don't want to return both errors
      return true;
    }
  }
}

@ValidatorConstraint()
class ProfessionToOrganisationMustHaveOrganisation
  implements ValidatorConstraintInterface
{
  validate(params: ProfessionToOrganisationParams[]) {
    if (nonBlankParameters(params).length) {
      return nonBlankParameters(params).every(
        (p: ProfessionToOrganisationParams) => p.organisation,
      );
    } else {
      // If the array is blank, we return true, because `ProfessionToOrganisationNotBlank`
      // will have been raised, and we don't want to return both errors
      return true;
    }
  }
}

@ValidatorConstraint()
class ProfessionToOrganisationNotBlank implements ValidatorConstraintInterface {
  validate(params: ProfessionToOrganisationParams[]) {
    return nonBlankParameters(params).length > 0;
  }
}

export class OrganisationsDto {
  @Validate(ProfessionToOrganisationNotBlank, {
    message: 'professions.form.errors.professionToOrganisations.blank',
  })
  @Validate(ProfessionToOrganisationMustHaveRole, {
    message: 'professions.form.errors.professionToOrganisations.missingRole',
  })
  @Validate(ProfessionToOrganisationMustHaveOrganisation, {
    message:
      'professions.form.errors.professionToOrganisations.missingAuthority',
  })
  professionToOrganisations: ProfessionToOrganisationParams[];

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}
