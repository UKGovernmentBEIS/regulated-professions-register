import { IsNotEmpty, ValidateIf } from 'class-validator';
import { UserEditSource } from '../../users.controller';

export class OrganisationDto {
  @IsNotEmpty({
    message: 'users.form.errors.serviceOwner.empty',
  })
  serviceOwner: string;

  @IsNotEmpty({
    message: 'users.form.errors.organisation.empty',
  })
  @ValidateIf((e) => e.serviceOwner === '0')
  organisation: string;

  source: UserEditSource;
}
