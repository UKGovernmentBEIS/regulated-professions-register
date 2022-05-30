import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';
import { MAX_SINGLE_LINE_LENGTH } from '../../../helpers/input-limits';
import { preprocessEmail } from '../../../helpers/preprocess-email.helper';
import { UserEditSource } from '../../users.controller';

export class PersonalDetailsDto {
  @IsNotEmpty({
    message: 'users.form.errors.name.empty',
  })
  @MaxLength(MAX_SINGLE_LINE_LENGTH, {
    message: 'users.form.errors.name.long',
  })
  name: string;

  @IsEmail({}, { message: 'users.form.errors.email.invalid' })
  @Transform(({ value }) => preprocessEmail(value))
  email: string;

  source: UserEditSource;
}
