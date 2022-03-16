import { Transform } from 'class-transformer';
import { IsUrl, ValidateIf } from 'class-validator';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';

export class RegistrationDto {
  registrationRequirements: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.registrationUrl.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.registrationUrl)
  registrationUrl: string;
}
