import { Organisation } from '../organisations/organisation.entity';
import { Profession } from '../professions/profession.entity';

export function isConfirmed(
  entityWithSlug: Profession | Organisation,
): boolean {
  return !!entityWithSlug.slug;
}
