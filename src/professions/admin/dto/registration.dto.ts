import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';
import { MandatoryRegistration } from '../../profession.entity';

export class RegistrationDto {
  @IsNotEmpty({
    message: 'professions.form.errors.mandatoryRegistration.empty',
  })
  mandatoryRegistration: MandatoryRegistration;

  registrationRequirements: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.registrationUrl.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.registrationUrl)
  registrationUrl: string;

  change: string;
}
