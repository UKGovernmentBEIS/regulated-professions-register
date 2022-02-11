import { IsNotEmpty } from 'class-validator';
import { MandatoryRegistration } from '../../profession.entity';

export class RegulatoryBodyDto {
  @IsNotEmpty({
    message: 'professions.form.errors.regulatoryBody.empty',
  })
  regulatoryBody: string;

  @IsNotEmpty({
    message: 'professions.form.errors.mandatoryRegistration.empty',
  })
  mandatoryRegistration: MandatoryRegistration;

  change: boolean;
}
