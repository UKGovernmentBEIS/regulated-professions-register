import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { checkCanViewOrganisation } from './check-can-view-organisation';
import { checkCanViewProfession } from './check-can-view-profession';
import { ProfessionToOrganisation } from './../../professions/profession-to-organisation.entity';

jest.mock('./check-can-view-organisation');

describe('checkCanViewProfession', () => {
  it('passes in a Profession with an organisation to call CheckCanViewOrganisation', () => {
    const organisation1 = organisationFactory.build();
    const organisation2 = organisationFactory.build();

    const profession = professionFactory.build({
      professionToOrganisations: [
        {
          organisation: organisation1,
        },
        {
          organisation: organisation2,
        },
      ] as ProfessionToOrganisation[],
    });

    const request = createDefaultMockRequest({ profession: profession });
    checkCanViewProfession(request, profession);

    expect(checkCanViewOrganisation).toHaveBeenCalledWith(
      request,
      organisation1,
    );

    expect(checkCanViewOrganisation).toHaveBeenCalledWith(
      request,
      organisation2,
    );
  });
});
