import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUrl, ValidateIf } from 'class-validator';
import { parseBoolean } from '../../../helpers/parse-boolean.helper';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';

export default class LegislationDto {
  @IsNotEmpty({
    message: 'professions.form.errors.legislation.nationalLegislation.empty',
  })
  nationalLegislation: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.legislation.link.invalid',
  })
  @ValidateIf((e) => e.link)
  @Transform(({ value }) => preprocessUrl(value))
  link: string;

  @IsNotEmpty({
    message:
      'professions.form.errors.legislation.secondNationalLegislation.empty',
  })
  @ValidateIf((e) => e.secondLink || e.secondNationalLegislation)
  secondNationalLegislation?: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.legislation.secondLink.invalid',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.secondLink || e.secondNationalLegislation)
  secondLink?: string;

  @Transform(({ value }) => parseBoolean(value))
  change: boolean;
}
