import { JSDOM } from 'jsdom';
import * as nunjucks from 'nunjucks';

import { nunjucksEnvironment } from '../../testutils/nunjucksEnvironment';

import organisationFactory from '../../../src/testutils/factories/organisation';
import professionFactory from '../../../src/testutils/factories/profession';

describe('show.njk', () => {
  beforeAll(async () => {
    await nunjucksEnvironment();
  });

  it('should link to admin-facing page for organisation', () => {
    const profession = professionFactory.build();
    const organisation1 = organisationFactory.build({
      id: 'organisation-id',
      versionId: 'version-id',
    });
    const organisations = {
      role1: [organisation1],
    };

    nunjucks.render(
      'admin/professions/show.njk',
      {
        profession,
        organisations,
        permissions: [],
        canChangeProfession: () => {
          return true;
        },
      },
      function (_err, res) {
        const dom = new JSDOM(res);

        const links = dom.window.document.querySelectorAll(
          '.rpr-details__sub-group .govuk-link',
        );

        expect(links[0].getAttribute('href')).toEqual(
          '/admin/organisations/organisation-id/versions/version-id',
        );
      },
    );
  });
});
