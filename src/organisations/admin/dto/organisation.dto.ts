import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsUrl,
  Validate,
  ValidateIf,
} from 'class-validator';
import { preprocessEmail } from '../../../helpers/preprocess-email.helper';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { validateTelephone } from '../../../helpers/validate-telephone.helper';
import { preprocessTelephone } from '../../../helpers/preprocess-telephone.helper';

@ValidatorConstraint()
export class IsTelephoneConstraint implements ValidatorConstraintInterface {
  validate(telephone: string): boolean {
    return !telephone || validateTelephone(telephone);
  }
}

export class OrganisationDto {
  @IsNotEmpty({
    message: 'organisations.admin.form.errors.name.empty',
  })
  name: string;

  alternateName: string;

  @IsNotEmpty({
    message: 'organisations.admin.form.errors.address.empty',
  })
  address: string;

  @IsEmail(
    {},
    {
      message: 'organisations.admin.form.errors.email.invalid',
    },
  )
  @Transform(({ value }) => preprocessEmail(value))
  @ValidateIf((e) => e.email)
  email: string;

  @IsUrl(urlOptions, {
    message: 'organisations.admin.form.errors.url.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  url: string;

  @IsNotEmpty({
    message: 'organisations.admin.form.errors.phone.empty',
  })
  @Validate(IsTelephoneConstraint, {
    message: 'organisations.admin.form.errors.phone.invalid',
  })
  @Transform(({ value }) => preprocessTelephone(value))
  telephone: string;

  confirm?: boolean;
}
