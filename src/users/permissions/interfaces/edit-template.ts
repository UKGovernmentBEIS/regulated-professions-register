import { User, UserPermission } from '../../user.entity';

export interface EditTemplate extends User {
  backLink: string;
  permissions: Array<UserPermission>;
  change: boolean;
}
