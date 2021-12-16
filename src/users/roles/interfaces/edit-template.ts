import { User, UserRole } from '../../user.entity';

export interface EditTemplate extends User {
  backLink: string;
  roles: Array<UserRole>;
}
