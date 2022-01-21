import { User, UserPermission } from '../../user.entity';

export interface EditTemplate extends User {
  permissions: Array<UserPermission>;
  change: boolean;
}
