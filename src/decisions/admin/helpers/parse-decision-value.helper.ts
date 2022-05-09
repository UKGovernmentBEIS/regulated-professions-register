export function parseDecisionValue(
  value: string,
  zeroInvalidValues: boolean,
): number | null {
  const result = parseInt(value, 10);

  if (isNaN(result) || result < 0) {
    return zeroInvalidValues ? 0 : null;
  } else {
    return result;
  }
}
