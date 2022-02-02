import { UserPermission } from '../../user-permission';
import { User } from '../../user.entity';

export interface EditTemplate extends User {
  permissions: Array<UserPermission>;
  change: boolean;
}
