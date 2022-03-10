import { User } from '../user.entity';

export function getUserOrganisation(user: User): string {
  const isBEISUser = user.serviceOwner;

  return isBEISUser ? 'app.beis' : user.organisation.name;
}
