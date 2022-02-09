import { User } from '../user.entity';

export type ActionType = 'edit' | 'new';

export function getActionTypeFromUser(user: User): ActionType {
  return user.confirmed ? 'edit' : 'new';
}
