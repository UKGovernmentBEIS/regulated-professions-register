import userFactory from '../../testutils/factories/user';
import { Role } from '../role';
import { UserPermission } from '../user-permission';
import { getPermissionsFromUser } from './get-permissions-from-user.helper';

describe('getPermissionsFromUser', () => {
  describe('when the user is a service owner', () => {
    it("returns a list of permissions for the user's role", () => {
      const user = userFactory.build({
        serviceOwner: true,
        role: Role.Registrar,
      });

      const result = getPermissionsFromUser(user);

      expect(result).toContain(UserPermission.CreateProfession);
      expect(result).not.toContain(UserPermission.CreateUser);
    });
  });

  describe('when the user is not a service owner', () => {
    it("returns a list of permissions for the user's role", () => {
      const user = userFactory.build({
        serviceOwner: false,
        role: Role.Administrator,
      });

      const result = getPermissionsFromUser(user);

      expect(result).toContain(UserPermission.CreateUser);
      expect(result).not.toContain(UserPermission.CreateProfession);
    });

    describe('when the user has a role that should only exist on a service owner', () => {
      it('returns `undefined`', () => {
        const user = userFactory.build({
          serviceOwner: false,
          role: Role.Registrar,
        });

        const result = getPermissionsFromUser(user);

        expect(result).toEqual(undefined);
      });
    });
  });
});
