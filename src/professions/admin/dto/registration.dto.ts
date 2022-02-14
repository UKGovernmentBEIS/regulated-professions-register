import { IsNotEmpty } from 'class-validator';
import { MandatoryRegistration } from '../../profession.entity';

export class RegistrationDto {
  @IsNotEmpty({
    message: 'professions.form.errors.mandatoryRegistration.empty',
  })
  mandatoryRegistration: MandatoryRegistration;
}
