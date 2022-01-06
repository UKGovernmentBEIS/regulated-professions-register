import { Factory } from 'fishery';
import { User, UserRole } from '../../users/user.entity';

export default Factory.define<User>(({ sequence }) => ({
  id: sequence.toString(),
  email: 'user@example.com',
  name: 'Example User',
  roles: [UserRole.Admin],
  externalIdentifier: 'extid|1234567',
  confirmed: false,
  created_at: new Date(),
  updated_at: new Date(),
}));
