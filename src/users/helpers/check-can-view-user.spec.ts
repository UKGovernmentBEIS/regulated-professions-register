import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import userFactory from '../../testutils/factories/user';
import { checkCanViewOrganisation } from './check-can-view-organisation';
import { checkCanViewUser } from './check-can-view-user';

jest.mock('./check-can-view-organisation');

describe('checkCanViewUser', () => {
  it('passes in a user with an organisation to call CheckCanViewOrganisation', () => {
    const organisation = organisationFactory.build();
    const user = userFactory.build({
      serviceOwner: false,
      organisation: organisation,
    });

    const request = createDefaultMockRequest({ user: user });
    checkCanViewUser(request, user);

    expect(checkCanViewOrganisation).toHaveBeenCalledWith(
      request,
      organisation,
    );
  });
});
