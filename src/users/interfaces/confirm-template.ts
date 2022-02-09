import { ShowTemplate } from './show-template';
import { ActionType } from '../helpers/get-action-type-from-user';

export interface ConfirmTemplate extends ShowTemplate {
  action: ActionType;
}
