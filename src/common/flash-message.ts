export function flashMessage(heading: string, body?: string): string {
  let html = `<h3 class="govuk-notification-banner__heading">${heading}</h3>`;

  if (body) {
    html += `<p class="govuk-body">${body}</p>`;
  }

  return html;
}
