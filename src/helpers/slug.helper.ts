import slugify from 'slugify';

const maxLength = 100;

/**
 * Transforms a name string into a URL-safe slug
 *
 * @param name The name to generate a slug from
 * @param retryCount The number of times we've attempted to generate a unique
 *   slug
 * @returns The slug generated from the provided name
 */
export function generateSlug(name: string): string {
  return slugify(name, {
    remove: /[^a-zA-Z0-9 ]/,
    replacement: '-',
    lower: true,
    strict: true,
    trim: true,
  }).slice(0, maxLength);
}
