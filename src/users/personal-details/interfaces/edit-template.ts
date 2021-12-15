import { User } from '../../user.entity';

export interface EditTemplate extends User {
  backLink: string;
}
