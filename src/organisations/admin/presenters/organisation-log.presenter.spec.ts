import * as formatDateModule from '../../../common/utils';
import { dateOf } from '../../../testutils/date-of';
import organisationFactory from '../../../testutils/factories/organisation';
import userFactory from '../../../testutils/factories/user';
import { OrganisationLogPresenter } from './organisation-log.presenter';

describe('OrganisationLogPresenter', () => {
  describe('present', () => {
    describe('when the Profession has been edited by a user', () => {
      it('returns the details of the user and the last modification time', () => {
        const organisation = organisationFactory.build({
          changedByUser: userFactory.build({
            name: 'beis-rpr',
            email: 'beis-rpr@example.com',
          }),
          lastModified: new Date('01-01-2022'),
        });

        const formatDateSpy = jest
          .spyOn(formatDateModule, 'formatDate')
          .mockImplementation(dateOf);

        const result = new OrganisationLogPresenter(organisation).present();

        expect(result).toEqual({
          changedBy: {
            name: 'beis-rpr',
            email: 'beis-rpr@example.com',
          },
          lastModified: dateOf(new Date('01-01-2022')),
        });

        expect(formatDateSpy).toHaveBeenCalledWith(new Date('01-01-2022'));
      });
    });

    describe("when the Profession hasn't yet been edited by a user", () => {
      it('returns the last modification time set at creation', () => {
        const organisation = organisationFactory.build({
          lastModified: new Date('01-01-2022'),
        });

        const formatDateSpy = jest
          .spyOn(formatDateModule, 'formatDate')
          .mockImplementation(dateOf);

        const result = new OrganisationLogPresenter(organisation).present();

        expect(result).toEqual({
          changedBy: null,
          lastModified: dateOf(new Date('01-01-2022')),
        });

        expect(formatDateSpy).toHaveBeenCalledWith(new Date('01-01-2022'));
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
