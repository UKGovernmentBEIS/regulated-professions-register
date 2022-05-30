import { Transform } from 'class-transformer';
import { IsNotEmpty, IsUrl, MaxLength, ValidateIf } from 'class-validator';
import {
  MAX_MULTI_LINE_LENGTH,
  MAX_URL_LENGTH,
} from '../../../helpers/input-limits';
import {
  preprocessUrl,
  urlOptions,
} from '../../../helpers/preprocess-url.helper';

export default class LegislationDto {
  @IsNotEmpty({
    message: 'professions.form.errors.legislation.nationalLegislation.empty',
  })
  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message: 'professions.form.errors.legislation.nationalLegislation.long',
  })
  nationalLegislation: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.legislation.link.invalid',
  })
  @MaxLength(MAX_URL_LENGTH, {
    message: 'professions.form.errors.legislation.link.long',
  })
  @ValidateIf((e) => e.link)
  @Transform(({ value }) => preprocessUrl(value))
  link: string;

  @IsNotEmpty({
    message:
      'professions.form.errors.legislation.secondNationalLegislation.empty',
  })
  @MaxLength(MAX_MULTI_LINE_LENGTH, {
    message:
      'professions.form.errors.legislation.secondNationalLegislation.long',
  })
  @ValidateIf((e) => e.secondLink || e.secondNationalLegislation)
  secondNationalLegislation?: string;

  @IsUrl(urlOptions, {
    message: 'professions.form.errors.legislation.secondLink.invalid',
  })
  @MaxLength(MAX_URL_LENGTH, {
    message: 'professions.form.errors.secondLink.link.long',
  })
  @Transform(({ value }) => preprocessUrl(value))
  @ValidateIf((e) => e.secondLink)
  secondLink?: string;
}
