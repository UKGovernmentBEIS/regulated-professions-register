import { validateTelephone } from './validate-telephone.helper';

export function preprocessTelephone(
  telephone: string,
  revertIfInvalid = true,
): string {
  if (!telephone) {
    return telephone;
  }

  const trimmedTelephone = telephone.trim();
  const decorationRemovedTelephone = trimmedTelephone.replace(/[-\.]+/g, ' ');
  const multipleSpacesRemovedTelephone = decorationRemovedTelephone.replace(
    / ( )+/g,
    ' ',
  );
  const bracketsRemoved = multipleSpacesRemovedTelephone.replace(
    /[\(\)\.-]/g,
    '',
  );

  if (!revertIfInvalid || validateTelephone(bracketsRemoved)) {
    return bracketsRemoved;
  }

  return telephone;
}
