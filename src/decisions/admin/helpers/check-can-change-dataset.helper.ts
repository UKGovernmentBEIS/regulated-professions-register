import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RequestWithAppSession } from '../../../common/interfaces/request-with-app-session.interface';
import { Organisation } from '../../../organisations/organisation.entity';
import { getOrganisationsFromProfession } from '../../../professions/helpers/get-organisations-from-profession.helper';
import { Profession } from '../../../professions/profession.entity';
import { getActingUser } from '../../../users/helpers/get-acting-user.helper';
import { User } from '../../../users/user.entity';
import { getDecisionsYearsRange } from './get-decisions-years-range';

export function checkCanChangeDataset(
  request: RequestWithAppSession,
  profession: Profession,
  organisation: Organisation,
  year: number,
  datasetExists: boolean,
): void {
  const actingUser = getActingUser(request);

  checkUserForOrganisation(actingUser, organisation);

  if (!datasetExists) {
    checkProfessionForOrganisation(profession, organisation);
    checkYear(year);
  }
}

function checkUserForOrganisation(
  actingUser: User,
  organisation: Organisation,
): void {
  if (actingUser.serviceOwner) {
    return;
  }

  if (actingUser.organisation.id !== organisation.id) {
    throw new UnauthorizedException();
  }
}

function checkProfessionForOrganisation(
  profession: Profession,
  organisation: Organisation,
): void {
  if (
    !getOrganisationsFromProfession(profession).some(
      (professionOrganisation) => professionOrganisation.id === organisation.id,
    )
  ) {
    throw new BadRequestException();
  }
}

function checkYear(year: number): void {
  const { start, end } = getDecisionsYearsRange();

  if (year < start || year > end) {
    throw new BadRequestException();
  }
}
