import { Factory } from 'fishery';
import {
  MethodToObtain,
  Qualification,
} from '../../qualifications/qualification.entity';

export default Factory.define<Qualification>(({ sequence }) => ({
  id: sequence.toString(),
  level: 'Diploma from post-secondary level (more than 4 years)',
  commonPathToObtainDeprecated: 'General post-secondary education',
  commonPathToObtain: MethodToObtain.GeneralSecondaryEducation,
  otherCommonPathToObtain: '',
  educationDuration: '1.0 Year',
  educationDurationYears: 1,
  educationDurationMonths: 0,
  educationDurationDays: 0,
  educationDurationHours: 0,
  mandatoryProfessionalExperience: true,
  methodToObtainDeprecated: 'Vocational post-secondary education level',
  methodToObtain:
    MethodToObtain.GeneralPostSecondaryEducationMandatoryVocational,
  otherMethodToObtain: '',
  created_at: new Date(),
  updated_at: new Date(),
}));
