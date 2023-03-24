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
      UserPermission.EditOrganisation,
      UserPermission.PublishOrganisation,
      UserPermission.DeleteOrganisation,
      UserPermission.CreateProfession,
      UserPermission.EditProfession,
      UserPermission.DeleteProfession,
      UserPermission.PublishProfession,
      UserPermission.UploadDecisionData,
      UserPermission.PublishDecisionData,
      UserPermission.DownloadDecisionData,
      UserPermission.ViewDecisionData,
    ],
    [Role.Registrar]: [
      UserPermission.CreateOrganisation,
      UserPermission.EditOrganisation,
      UserPermission.PublishOrganisation,
      UserPermission.DeleteOrganisation,
      UserPermission.CreateProfession,
      UserPermission.EditProfession,
      UserPermission.DeleteProfession,
      UserPermission.PublishProfession,
      UserPermission.UploadDecisionData,
      UserPermission.PublishDecisionData,
      UserPermission.DownloadDecisionData,
      UserPermission.ViewDecisionData,
    ],
    [Role.Editor]: [
      UserPermission.EditOrganisation,
      UserPermission.PublishOrganisation,
      UserPermission.EditProfession,
      UserPermission.PublishProfession,
      UserPermission.UploadDecisionData,
      UserPermission.PublishDecisionData,
      UserPermission.DownloadDecisionData,
      UserPermission.ViewDecisionData,
    ],
  },
  notServiceOwner: {
    [Role.Administrator]: [
      UserPermission.CreateUser,
      UserPermission.EditUser,
      UserPermission.DeleteUser,
      UserPermission.EditOrganisation,
      UserPermission.PublishOrganisation,
      UserPermission.EditProfession,
      UserPermission.PublishProfession,
      UserPermission.UploadDecisionData,
      UserPermission.DownloadDecisionData,
      UserPermission.UploadDecisionData,
      UserPermission.SubmitDecisionData,
      UserPermission.DownloadDecisionData,
      // UserPermission.ViewDecisionData,
    ],
    [Role.Editor]: [
      UserPermission.EditOrganisation,
      UserPermission.PublishOrganisation,
      UserPermission.EditProfession,
      UserPermission.PublishProfession,
      UserPermission.UploadDecisionData,
      UserPermission.SubmitDecisionData,
      UserPermission.DownloadDecisionData,
      // UserPermission.ViewDecisionData,
    ],
  },
};

export function getPermissionsFromUser(user: User): UserPermission[] {
  return (
    user.serviceOwner ? permissions.serviceOwner : permissions.notServiceOwner
  )[user.role];
}
