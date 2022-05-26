import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { preprocessEmail } from '../../../helpers/preprocess-email.helper';
import { UserEditSource } from '../../users.controller';

export class PersonalDetailsDto {
  @IsNotEmpty({
    message: 'users.form.errors.name.empty',
  })
  name: string;

  @IsEmail({}, { message: 'users.form.errors.email.invalid' })
  @Transform(({ value }) => preprocessEmail(value))
  email: string;

  source: UserEditSource;
}
