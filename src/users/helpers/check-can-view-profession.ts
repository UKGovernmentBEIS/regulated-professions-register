import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Profession } from '../../professions/profession.entity';
import { checkCanViewOrganisation } from './check-can-view-organisation';

export function checkCanViewProfession(
  request: RequestWithAppSession,
  profession: Profession,
) {
  checkCanViewOrganisation(request, profession.organisation);
}
