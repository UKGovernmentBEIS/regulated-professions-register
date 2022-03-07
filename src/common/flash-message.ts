import { escape } from '../helpers/escape.helper';

export function flashMessage(heading: string, body?: string): string {
  let html = `<h3 class="govuk-notification-banner__heading">${escape(
    heading,
  )}</h3>`;

  if (body) {
    html += `<p class="govuk-body">${escape(body)}</p>`;
  }

  return html;
}
