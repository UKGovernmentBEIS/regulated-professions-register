export function pad<T>(array: T[], minimumLength: number): T[] {
  if (!array) {
    array = [];
  }

  const padding = minimumLength - array.length;

  if (padding > 0) {
    return array.concat(Array(padding).fill(undefined));
  } else {
    return array;
  }
}
