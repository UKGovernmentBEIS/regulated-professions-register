import { Nation } from './../nations/nation';

export function allNations(): string[] {
  return Nation.all().map((nation) => nation.code);
}

export function isUK(nationCodes: string[]) {
  const nations = allNations();

  return (
    nationCodes.length === nations.length &&
    nationCodes.every((e, i) => e === nations[i])
  );
}
