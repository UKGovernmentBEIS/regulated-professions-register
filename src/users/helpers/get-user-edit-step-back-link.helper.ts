export function getUserEditStepBackLink(
  values: Record<string, any>,
  previousStep: string,
): string {
  if (values.source === 'confirm') {
    return '/admin/users/:id/confirm';
  } else if (values.source === 'show') {
    return '/admin/users/:id';
  } else {
    return previousStep;
  }
}
