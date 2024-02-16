export function getPathFromReferrer(referrer: string | undefined): string {
  if (referrer) {
    const urlObject = new URL(referrer as string);
    const path = urlObject.pathname; // Extracts the page portion of the URL
    return `${path}`;
  } else {
    return '/';
  }
}
