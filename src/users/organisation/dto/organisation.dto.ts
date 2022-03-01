import { Transform } from 'class-transformer';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';

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

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}
