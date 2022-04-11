import { Organisation } from '../../organisations/organisation.entity';

export function organisationList(organisations: Organisation[]): string {
  if (organisations.length === 0) {
    return '';
  }

  let list = '<ul class="govuk-list">';

  for (const organisation of organisations) {
    list += `<li><a class="govuk-link" href="/regulatory-authorities/${organisation.slug}">${organisation.name}</a></li>`;
  }

  list += '</ul>';

  return list;
}
