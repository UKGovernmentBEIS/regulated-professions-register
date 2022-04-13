import { Transform } from 'class-transformer';
import { IsNotEmpty, ValidateIf } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';

export class NewDto {
  @Transform(({ value }) => parseBoolean(value))
  serviceOwner: boolean;

  @IsNotEmpty({
    message: 'decisions.admin.new.errors.profession.empty',
  })
  profession: string;

  @ValidateIf((e) => e.serviceOwner)
  @IsNotEmpty({
    message: 'decisions.admin.new.errors.organisation.empty',
  })
  organisation: string;

  @IsNotEmpty({
    message: 'decisions.admin.new.errors.year.empty',
  })
  year: string;
}
