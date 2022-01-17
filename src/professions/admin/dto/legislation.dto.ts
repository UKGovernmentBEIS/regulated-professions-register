import { IsNotEmpty } from 'class-validator';

export default class LegislationDto {
  @IsNotEmpty({
    message: 'professions.form.errors.legislation.nationalLegislation.empty',
  })
  nationalLegislation: string;

  @IsNotEmpty({
    message: 'professions.form.errors.legislation.link.empty',
  })
  link: string;
}
