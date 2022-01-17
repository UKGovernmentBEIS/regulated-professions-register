import { IsEmail, IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';

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
  @ValidateIf((e) => e.email !== undefined)
  email: string;

  @IsUrl(
    {},
    {
      message: 'organisations.admin.form.errors.url.invalid',
    },
  )
  url: string;

  @IsUrl(
    {},
    {
      message: 'organisations.admin.form.errors.contactUrl.invalid',
    },
  )
  @ValidateIf((e) => e.contactUrl !== undefined)
  contactUrl: string;

  telephone: string;
  fax: string;
}
