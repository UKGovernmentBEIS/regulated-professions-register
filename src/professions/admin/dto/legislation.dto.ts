import { IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';

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

  @IsNotEmpty({
    message:
      'professions.form.errors.legislation.secondNationalLegislation.empty',
  })
  @ValidateIf((e) => e.secondLink || e.secondNationalLegislation)
  secondNationalLegislation?: string;

  @IsUrl(
    {},
    {
      message: 'professions.form.errors.legislation.secondLink.invalid',
    },
  )
  @ValidateIf((e) => e.secondLink || e.secondNationalLegislation)
  secondLink?: string;

  change: string;
}
