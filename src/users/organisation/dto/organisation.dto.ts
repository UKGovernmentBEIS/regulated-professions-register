import { IsNotEmpty } from 'class-validator';

export class OrganisationDto {
  @IsNotEmpty({
    message: 'users.form.errors.serviceOwner.empty',
  })
  serviceOwner: string;

  @IsNotEmpty({
    message: 'users.form.errors.organisation.empty',
  })
  organisation: string;

  change: string;
}
