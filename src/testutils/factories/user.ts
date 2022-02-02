import { Factory } from 'fishery';
import { Role } from '../../users/role';
import { User } from '../../users/user.entity';

export default Factory.define<User>(({ sequence }) => ({
  id: sequence.toString(),
  email: 'user@example.com',
  name: 'Example User',
  role: Role.Editor,
  externalIdentifier: 'extid|1234567',
  organisationVersions: [],
  serviceOwner: false,
  confirmed: false,
  created_at: new Date(),
  updated_at: new Date(),
}));
