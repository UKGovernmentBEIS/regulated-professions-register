import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';
import { preprocessEmail } from '../../../helpers/preprocess-email.helper';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';

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
  telephone: string;

  confirm?: boolean;
}
