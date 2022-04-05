import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';

export class TopLevelDetailsDto {
  @IsNotEmpty({ message: 'professions.form.errors.name.empty' })
  name: string;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}
