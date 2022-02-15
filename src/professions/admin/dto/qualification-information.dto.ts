import { IsNotEmpty, ValidateIf, IsUrl } from 'class-validator';
import { MethodToObtain } from '../../../qualifications/qualification.entity';

export class QualificationInformationDto {
  @IsNotEmpty({ message: 'professions.form.errors.qualification.level.empty' })
  level: string;

  @IsNotEmpty({
    message: 'professions.form.errors.qualification.methodToObtain.empty',
  })
  methodToObtainQualification: MethodToObtain;

  @ValidateIf(
    (dto: QualificationInformationDto) =>
      dto.methodToObtainQualification === MethodToObtain.Others,
  )
  @IsNotEmpty({
    message: 'professions.form.errors.qualification.otherMethodToObtain.empty',
  })
  otherMethodToObtainQualification: string;

  @IsNotEmpty({
    message:
      'professions.form.errors.qualification.mostCommonPathToObtain.empty',
  })
  mostCommonPathToObtainQualification: MethodToObtain;

  @ValidateIf(
    (dto: QualificationInformationDto) =>
      dto.mostCommonPathToObtainQualification === MethodToObtain.Others,
  )
  @IsNotEmpty({
    message:
      'professions.form.errors.qualification.otherMostCommonPathToObtain.empty',
  })
  otherMostCommonPathToObtainQualification: string;

  @IsNotEmpty({
    message: 'professions.form.errors.qualification.duration.empty',
  })
  duration: string;

  @IsNotEmpty({
    message:
      'professions.form.errors.qualification.mandatoryProfessionalExperience.empty',
  })
  mandatoryProfessionalExperience: string;

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
