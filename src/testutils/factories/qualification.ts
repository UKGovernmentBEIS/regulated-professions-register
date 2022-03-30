import { Factory } from 'fishery';
import {
  OtherCountriesRecognitionRoutes,
  Qualification,
} from '../../qualifications/qualification.entity';

export default Factory.define<Qualification>(({ sequence }) => ({
  id: sequence.toString(),
  routesToObtain: 'Routes to obtain',
  url: 'http://www.example.com',
  professionVersion: undefined,
  ukRecognition: undefined,
  ukRecognitionUrl: undefined,
  otherCountriesRecognitionRoutes: OtherCountriesRecognitionRoutes.All,
  otherCountriesRecognitionSummary: undefined,
  otherCountriesRecognitionUrl: undefined,
  created_at: new Date(),
  updated_at: new Date(),
}));
