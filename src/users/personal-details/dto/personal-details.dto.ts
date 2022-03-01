import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';

export class PersonalDetailsDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}
