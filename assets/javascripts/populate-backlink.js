export function populateBacklink() {
  const backLink = document.querySelector(
    '.govuk-back-link[data-populate-backlink="true"]',
  );

  if (backLink) {
    backLink.addEventListener('click', () => {
      history.back();
    });
    backLink.classList.remove('govuk-visually-hidden');
  }
}
