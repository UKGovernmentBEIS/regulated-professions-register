import { Role } from '../role';
import { UserPermission } from '../user-permission';
import { User } from '../user.entity';

const permissions = {
  serviceOwner: {
    [Role.Administrator]: [
      UserPermission.CreateUser,
      UserPermission.EditUser,
      UserPermission.DeleteUser,
      UserPermission.CreateOrganisation,
      UserPermission.DeleteOrganisation,
      UserPermission.CreateProfession,
      UserPermission.DeleteProfession,
      UserPermission.UploadDecisionData,
      UserPermission.DownloadDecisionData,
      UserPermission.ViewDecisionData,
    ],
    [Role.Registrar]: [
      UserPermission.CreateOrganisation,
      UserPermission.DeleteOrganisation,
      UserPermission.CreateProfession,
      UserPermission.DeleteProfession,
    ],
    [Role.Editor]: [],
  },
  notServiceOwner: {
    [Role.Administrator]: [
      UserPermission.CreateUser,
      UserPermission.EditUser,
      UserPermission.DeleteUser,
      UserPermission.UploadDecisionData,
      UserPermission.DownloadDecisionData,
      UserPermission.ViewDecisionData,
    ],
    [Role.Editor]: [],
  },
};

export function getPermissionsFromUser(user: User): UserPermission[] {
  return (
    user.serviceOwner ? permissions.serviceOwner : permissions.notServiceOwner
  )[user.role];
}
