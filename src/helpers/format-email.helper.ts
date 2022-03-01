import { isEmail } from 'class-validator';
import { escape } from './escape.helper';
import { preprocessEmail } from './preprocess-email.helper';

export function formatEmail(email: string): string {
  if (!email) {
    return '';
  }

  const preprocessedEmail = preprocessEmail(email);

  if (!isEmail(preprocessedEmail)) {
    return escape(email);
  }

  const escapedEmail = escape(preprocessedEmail);

  return `<a href="mailto:${escapedEmail}" class="govuk-link">${escapedEmail}</a>`;
}
