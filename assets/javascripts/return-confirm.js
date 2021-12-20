export function returnConfirm() {
  const confirmForm = document.querySelector('[data-confirm]');

  if (!confirmForm) return false;

  confirmForm.addEventListener('submit', (e) => {
    const message = confirmForm.dataset['confirmMessage'];
    if (confirm(message)) {
      confirmForm.submit();
    } else {
      e.preventDefault();
    }
  });
}
