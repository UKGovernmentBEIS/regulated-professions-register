import { IsNotEmpty } from 'class-validator';

export class TopLevelDetailsDto {
  @IsNotEmpty({ message: 'professions.form.errors.name.empty' })
  name: string;

  @IsNotEmpty({
    message: 'professions.form.errors.regulatoryBody.empty',
  })
  regulatoryBody: string;

  additionalRegulatoryBody: string;

  change: string;
}
