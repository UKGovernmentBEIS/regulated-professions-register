import { IsNotEmpty, ValidateIf, IsUrl } from 'class-validator';

export class QualificationsDto {
  @IsNotEmpty({ message: 'professions.form.errors.qualification.level.empty' })
  level: string;

  @IsNotEmpty({
    message: 'professions.form.errors.qualification.routesToObtain.empty',
  })
  routesToObtain: string;

  @IsNotEmpty({
    message:
      'professions.form.errors.qualification.mostCommonRouteToObtain.empty',
  })
  mostCommonRouteToObtain: string;

  @IsNotEmpty({
    message: 'professions.form.errors.qualification.duration.empty',
  })
  duration: string;

  @IsNotEmpty({
    message:
      'professions.form.errors.qualification.mandatoryProfessionalExperience.empty',
  })
  mandatoryProfessionalExperience: string;

  @IsUrl(
    {},
    {
      message:
        'professions.form.errors.qualification.moreInformationUrl.invalid',
    },
  )
  @ValidateIf((e) => e.moreInformationUrl)
  moreInformationUrl: string;

  ukRecognition: string;

  @IsUrl(
    {},
    {
      message: 'professions.form.errors.qualification.ukRecognitionUrl.invalid',
    },
  )
  @ValidateIf((e) => e.ukRecognitionUrl)
  ukRecognitionUrl: string;

  otherCountriesRecognition: string;

  @IsUrl(
    {},
    {
      message:
        'professions.form.errors.qualification.otherCountriesRecognitionUrl.invalid',
    },
  )
  @ValidateIf((e) => e.otherCountriesRecognitionUrl)
  otherCountriesRecognitionUrl: string;

  change: boolean;
}
