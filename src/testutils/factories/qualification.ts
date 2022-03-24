import { Factory } from 'fishery';
import { Qualification } from '../../qualifications/qualification.entity';

export default Factory.define<Qualification>(({ sequence }) => ({
  id: sequence.toString(),
  routesToObtain: 'Routes to obtain',
  url: 'http://www.example.com',
  professionVersion: undefined,
  ukRecognition: undefined,
  ukRecognitionUrl: undefined,
  otherCountriesRecognitionRoutes: undefined,
  otherCountriesRecognitionSummary: undefined,
  otherCountriesRecognitionUrl: undefined,
  created_at: new Date(),
  updated_at: new Date(),
}));
