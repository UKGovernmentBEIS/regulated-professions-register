import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { checkCanViewOrganisation } from './check-can-view-organisation';
import { checkCanViewProfession } from './check-can-view-profession';

jest.mock('./check-can-view-organisation');

describe('checkCanViewProfession', () => {
  it('passes in a Profession with an organisation to call CheckCanViewOrganisation', () => {
    const organisation = organisationFactory.build();
    const profession = professionFactory.build({
      organisation: organisation,
    });

    const request = createDefaultMockRequest({ profession: profession });
    checkCanViewProfession(request, profession);

    expect(checkCanViewOrganisation).toHaveBeenCalledWith(
      request,
      organisation,
    );
  });
});
