import organisationFactory from '../../testutils/factories/organisation';
import { organisationList } from './organisation-list';

describe('organisationList', () => {
  it('displays organisations in a HTML list', () => {
    const organisations = organisationFactory.buildList(3);

    const list = organisationList(organisations);

    expect(list).toMatch('<ul class="govuk-list">');
    expect(list).toMatch('</ul>');

    for (const organisation of organisations) {
      expect(list).toMatch(
        `<li><a class="govuk-link" href="/regulatory-authorities/${organisation.slug}">${organisation.name}</a></li>`,
      );
    }
  });

  it('returns an empty string when there are no organisations', () => {
    const list = organisationList([]);

    expect(list).toEqual('');
  });
});
