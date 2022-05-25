import { User } from '../../user.entity';
import { ActionType } from '../../helpers/get-action-type-from-user';
import { UserEditSource } from '../../users.controller';
export interface EditTemplate extends User {
  source: UserEditSource;
  action: ActionType;
}
