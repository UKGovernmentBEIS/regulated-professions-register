import { IsNotEmpty, IsUrl } from 'class-validator';

export default class LegislationDto {
  @IsNotEmpty({
    message: 'professions.form.errors.legislation.nationalLegislation.empty',
  })
  nationalLegislation: string;

  @IsUrl(
    {},
    {
      message: 'professions.form.errors.legislation.link.invalid',
    },
  )
  link: string;

  change: boolean;
}
