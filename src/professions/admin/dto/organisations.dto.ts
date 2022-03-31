import { Transform } from 'class-transformer';
import { ArrayNotEmpty } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';

export class OrganisationsDto {
  @ArrayNotEmpty({
    message: 'professions.form.errors.professionToOrganisations.empty',
  })
  professionToOrganisations: Array<{
    organisation: string;
    role: string;
  }>;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}
