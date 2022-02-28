import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';
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
  address: string;

  @IsEmail(
    {},
    {
      message: 'organisations.admin.form.errors.email.invalid',
    },
  )
  @ValidateIf((e) => e.email)
  email: string;

  @IsUrl(urlOptions, {
    message: 'organisations.admin.form.errors.url.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  url: string;

  @IsUrl(urlOptions, {
    message: 'organisations.admin.form.errors.contactUrl.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.contactUrl)
  contactUrl: string;

  telephone: string;
  fax: string;

  confirm?: boolean;
}
