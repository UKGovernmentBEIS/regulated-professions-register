import { User } from '../../user.entity';
import { ActionType } from '../../helpers/get-action-type-from-user';
export interface EditTemplate extends User {
  change: boolean;
  action: ActionType;
}
