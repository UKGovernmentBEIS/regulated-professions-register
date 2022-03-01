import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';

export class TopLevelDetailsDto {
  @IsNotEmpty({ message: 'professions.form.errors.name.empty' })
  name: string;

  @IsNotEmpty({
    message: 'professions.form.errors.regulatoryBody.empty',
  })
  regulatoryBody: string;

  additionalRegulatoryBody: string;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}
