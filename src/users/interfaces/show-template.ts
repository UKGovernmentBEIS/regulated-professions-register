import { User } from '../user.entity';

export interface ShowTemplate extends User {
  permissionList: string;
}
