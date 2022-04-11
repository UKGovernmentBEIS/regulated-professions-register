export function decisionValueToString(value: number | null): string {
  if (value === null) {
    return '';
  } else {
    return value.toString();
  }
}
