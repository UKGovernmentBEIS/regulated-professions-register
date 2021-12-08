import slugify from 'slugify';

const maxLength = 100;

/**
 * Transforms a name string into a URL-safe slug
 *
 * @param name The name to generate a slug from
 * @returns The slug generated fro the provided name
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
