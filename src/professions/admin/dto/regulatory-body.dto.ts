import { IsNotEmpty } from 'class-validator';

export class RegulatoryBodyDto {
  @IsNotEmpty({
    message: 'professions.form.errors.regulatoryBody.empty',
  })
  regulatoryBody: string;

  additionalRegulatoryBody: string;

  change: boolean;
}
