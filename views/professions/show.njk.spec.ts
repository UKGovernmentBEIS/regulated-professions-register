import { JSDOM } from 'jsdom';
import * as nunjucks from 'nunjucks';

import { translationOf } from '../../src/testutils/translation-of';
import { nunjucksEnvironment } from '../testutils/nunjucksEnvironment';

import organisationFactory from '../../src/testutils/factories/organisation';
import professionFactory from '../../src/testutils/factories/profession';

describe('show.njk', () => {
  beforeAll(async () => {
    await nunjucksEnvironment();
  });

  it('should group organisations together', async () => {
    const profession = professionFactory.build();
    const organisation1 = organisationFactory.build();
    const organisation2 = organisationFactory.build();
    const organisation3 = organisationFactory.build();

    const organisations = {
      role1: [organisation1, organisation2],
      role2: [organisation3],
    };

    nunjucks.render(
      'professions/show.njk',
      { organisations, profession },
      function (_err, res) {
        const dom = new JSDOM(res);

        const subGroups = dom.window.document.querySelectorAll(
          '.rpr-details__sub-group',
        );

        expect(subGroups.length).toEqual(2);

        expect(subGroups[0].textContent).toMatch(
          translationOf('organisations.label.roles.role1'),
        );

        expect(subGroups[0].textContent).toMatch(organisation1.name);

        expect(subGroups[0].textContent).toMatch(organisation2.name);

        expect(subGroups[1].textContent).toMatch(
          translationOf('organisations.label.roles.role2'),
        );

        expect(subGroups[1].textContent).toMatch(organisation3.name);
      },
    );
  });
});
