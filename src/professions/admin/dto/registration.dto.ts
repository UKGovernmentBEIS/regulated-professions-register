import { IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';
import { MandatoryRegistration } from '../../profession.entity';

export class RegistrationDto {
  @IsNotEmpty({
    message: 'professions.form.errors.mandatoryRegistration.empty',
  })
  mandatoryRegistration: MandatoryRegistration;

  registrationRequirements: string;

  @IsUrl(
    {},
    {
      message: 'professions.form.errors.registrationUrl.invalid',
    },
  )
  @ValidateIf((e) => e.registrationUrl !== '')
  registrationUrl: string;
}
