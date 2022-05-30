import { Transform } from 'class-transformer';
import { IsUrl, MaxLength, ValidateIf } from 'class-validator';
import {
  MAX_MULTI_LINE_LENGTH,
  MAX_URL_LENGTH,
} from '../../../helpers/input-limits';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';

export class RegistrationDto {
  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message: 'professions.form.errors.registrationRequirements.long',
  })
  registrationRequirements: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.registrationUrl.invalid',
  })
  @MaxLength(MAX_URL_LENGTH, {
    message: 'professions.form.errors.registrationUrl.long',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.registrationUrl)
  registrationUrl: string;
}
