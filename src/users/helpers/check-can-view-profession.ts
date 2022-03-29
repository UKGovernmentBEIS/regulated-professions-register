import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Profession } from '../../professions/profession.entity';
import { checkCanViewOrganisation } from './check-can-view-organisation';
import { getOrganisationsFromProfession } from '../../professions/helpers/get-organisations-from-profession.helper';

export function checkCanViewProfession(
  request: RequestWithAppSession,
  profession: Profession,
) {
  for (const org of getOrganisationsFromProfession(profession)) {
    checkCanViewOrganisation(request, org);
  }
}
