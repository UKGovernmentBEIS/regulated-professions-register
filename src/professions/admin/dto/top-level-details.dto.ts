import { Transform } from 'class-transformer';
import { IsNotEmpty, MaxLength } from 'class-validator';
import { MAX_SINGLE_LINE_LENGTH } from '../../../helpers/input-limits';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';

export class TopLevelDetailsDto {
  @IsNotEmpty({ message: 'professions.form.errors.name.empty' })
  @MaxLength(MAX_SINGLE_LINE_LENGTH, {
    message: 'professions.form.errors.name.long',
  })
  name: string;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}
