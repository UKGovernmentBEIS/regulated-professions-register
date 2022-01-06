import { Factory } from 'fishery';
import { Qualification } from '../../qualifications/qualification.entity';

export default Factory.define<Qualification>(({ sequence }) => ({
  id: sequence.toString(),
  level: 'Diploma from post-secondary level (more than 4 years)',
  commonPathToObtain: 'General post-secondary education',
  educationDuration: '1.0 Year',
  mandatoryProfessionalExperience: true,
  methodToObtain: 'Vocational post-secondary education level',
  created_at: new Date(),
  updated_at: new Date(),
}));
