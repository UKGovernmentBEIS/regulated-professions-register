export function parseDecisionValue(value: string): number | null {
  const result = parseInt(value, 10);

  if (isNaN(result) || result < 0) {
    return null;
  } else {
    return result;
  }
}
