import { ShowTemplate } from './show-template';
import { ActionType } from '../helpers/get-action-type-from-user';

export interface CompleteTemplate extends ShowTemplate {
  action: ActionType;
}
