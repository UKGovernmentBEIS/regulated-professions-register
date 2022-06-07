import { Organisation } from '../../organisation.entity';
import { formatDate } from '../../../common/utils';
import { ShowTemplate } from '../interfaces/show-template.interface';

export class OrganisationLogPresenter {
  constructor(private readonly organisation: Organisation) {}

  present(): ShowTemplate['log'] {
    const user = this.organisation.changedByUser;

    return {
      changedBy: user
        ? {
            name: user.name,
            email: user.email,
          }
        : null,
      lastModified: formatDate(this.organisation.lastModified),
    };
  }
}
