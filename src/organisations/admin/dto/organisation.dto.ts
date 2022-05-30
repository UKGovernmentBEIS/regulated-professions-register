import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsUrl,
  MaxLength,
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
import {
  MAX_ADDRESS_LENGTH,
  MAX_SINGLE_LINE_LENGTH,
  MAX_URL_LENGTH,
} from '../../../helpers/input-limits';

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
  @MaxLength(MAX_SINGLE_LINE_LENGTH, {
    message: 'organisations.admin.form.errors.name.long',
  })
  name: string;

  @MaxLength(MAX_SINGLE_LINE_LENGTH, {
    message: 'organisations.admin.form.errors.alternateName.long',
  })
  alternateName: string;

  @IsUrl(urlOptions, {
    message: 'organisations.admin.form.errors.url.invalid',
  })
  @MaxLength(MAX_URL_LENGTH, {
    message: 'organisations.admin.form.errors.url.long',
  })
  @Transform(({ value }) => preprocessUrl(value))
  url: string;

  @IsEmail(
    {},
    {
      message: 'organisations.admin.form.errors.email.invalid',
    },
  )
  @Transform(({ value }) => preprocessEmail(value))
  @ValidateIf((e) => e.email)
  email: string;

  @IsNotEmpty({
    message: 'organisations.admin.form.errors.phone.empty',
  })
  @Validate(IsTelephoneConstraint, {
    message: 'organisations.admin.form.errors.phone.invalid',
  })
  @Transform(({ value }) => preprocessTelephone(value))
  telephone: string;

  @IsNotEmpty({
    message: 'organisations.admin.form.errors.address.empty',
  })
  @MaxLength(MAX_ADDRESS_LENGTH, {
    message: 'organisations.admin.form.errors.address.long',
  })
  address: string;

  confirm?: boolean;
}
