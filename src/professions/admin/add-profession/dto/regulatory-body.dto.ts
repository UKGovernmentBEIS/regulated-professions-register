import { IsNotEmpty } from 'class-validator';
import { MandatoryRegistration } from '../../../profession.entity';

export class RegulatoryBodyDto {
  @IsNotEmpty()
  regulatoryBody: string;

  @IsNotEmpty()
  mandatoryRegistration: MandatoryRegistration;

  change: boolean;
}
