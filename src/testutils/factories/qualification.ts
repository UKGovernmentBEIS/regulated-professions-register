import { Factory } from 'fishery';
import { Qualification } from '../../qualifications/qualification.entity';

export default Factory.define<Qualification>(({ sequence }) => ({
  id: sequence.toString(),
  level: 'Diploma from post-secondary level (more than 4 years)',
  mostCommonRouteToObtain: '',
  educationDuration: '1.0 Year',
  mandatoryProfessionalExperience: true,
  routesToObtain: '',
  professionVersion: undefined,
  ukRecognition: undefined,
  ukRecognitionUrl: undefined,
  otherCountriesRecognition: undefined,
  otherCountriesRecognitionUrl: undefined,
  created_at: new Date(),
  updated_at: new Date(),
}));
