import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';
import { preprocessEmail } from '../../../helpers/preprocess-email.helper';

export class PersonalDetailsDto {
  @IsNotEmpty({
    message: 'users.form.errors.name.empty',
  })
  name: string;

  @IsEmail({}, { message: 'users.form.errors.email.invalid' })
  @Transform(({ value }) => preprocessEmail(value))
  email: string;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}
