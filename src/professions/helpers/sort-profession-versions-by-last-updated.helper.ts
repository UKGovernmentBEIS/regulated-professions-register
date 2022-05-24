import { ProfessionVersion } from '../profession-version.entity';

export function sortProfessionVersionsByLastUpdated(
  versions: ProfessionVersion[],
): ProfessionVersion[] {
  return versions.sort(
    (a, b) => b.updated_at.getTime() - a.updated_at.getTime(),
  );
}
