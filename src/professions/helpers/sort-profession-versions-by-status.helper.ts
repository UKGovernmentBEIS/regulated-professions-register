import {
  ProfessionVersion,
  ProfessionVersionStatus,
} from '../profession-version.entity';

export function sortProfessionVersionsByStatus(
  versions: ProfessionVersion[],
): ProfessionVersion[] {
  const statusOrder = [
    ProfessionVersionStatus.Draft,
    ProfessionVersionStatus.Live,
    ProfessionVersionStatus.Archived,
    ProfessionVersionStatus.Unconfirmed,
  ];

  return versions.sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
  );
}
