import { Transform } from 'class-transformer';
import { IsUrl, ValidateIf } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';
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

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}
