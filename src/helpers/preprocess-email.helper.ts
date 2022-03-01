import { isEmail } from 'class-validator';

export function preprocessEmail(email: string): string {
  if (!email) {
    return email;
  }

  const trimmedEmail = email.trim();

  if (isEmail(trimmedEmail)) {
    return trimmedEmail;
  }

  return email;
}
