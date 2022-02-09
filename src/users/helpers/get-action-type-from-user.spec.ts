import userFactory from '../../testutils/factories/user';
import { getActionTypeFromUser } from './get-action-type-from-user';

describe('getActionTypeFromUser', () => {
  it('returns `new` when the user is not confirmed', () => {
    const user = userFactory.build({ confirmed: false });
    expect(getActionTypeFromUser(user)).toEqual('new');
  });

  it('returns `edit` when the user is confirmed', () => {
    const user = userFactory.build({ confirmed: true });
    expect(getActionTypeFromUser(user)).toEqual('edit');
  });
});
