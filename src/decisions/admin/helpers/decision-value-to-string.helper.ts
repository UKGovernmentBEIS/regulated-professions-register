export function decisionValueToString(value: number | null): string {
  if (value === null) {
    return '';
  } else if (value === undefined) {
    return '0';
  } else {
    return value.toString();
  }
}
