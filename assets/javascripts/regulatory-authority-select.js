const regulatoryAuthorityContainerSelector =
  '.rpr-internal__regulatory-authority-input-container';

function showRegulator(event) {
  const hiddenRegulatoryAuthorityContainerSelector =
    regulatoryAuthorityContainerSelector + '.govuk-visually-hidden';
  const items = document.querySelectorAll(
    hiddenRegulatoryAuthorityContainerSelector,
  );

  const latestRegulator = items[0];

  showElement(latestRegulator);

  const regulatoryAuthoritySelect = latestRegulator.querySelector(
    'select.organisation',
  );
  const roleSelect = latestRegulator.querySelector('select.role');

  regulatoryAuthoritySelect.removeAttribute('tabindex');
  roleSelect.removeAttribute('tabindex');

  addRemoveButton(latestRegulator);

  // If there are no more hidden containers left, hide the button.
  if (
    document.querySelectorAll(hiddenRegulatoryAuthorityContainerSelector)
      .length == 0
  ) {
    hideElement(addButton);
  }

  event.preventDefault();
}

function addRemoveButton(container) {
  const buttonTemplate = document.querySelector('#removeButton');
  const removeButton = buttonTemplate.content.cloneNode(true);

  container.appendChild(removeButton);

  const button = container.querySelector('[data-purpose="removeRegulator"]');

  button.addEventListener('click', removeRegulator);
  button.setAttribute('aria-controls', container.id);
}

function initialize(items) {
  for (var i = 1; i < items.length; i++) {
    const item = items[i];
    const regulatoryAuthoritySelect = item.querySelector('select.organisation');
    const roleSelect = item.querySelector('select.role');

    regulatoryAuthoritySelect.setAttribute('tabindex', '-1');
    roleSelect.setAttribute('tabindex', '-1');

    if (
      regulatoryAuthoritySelect.value.length === 0 &&
      roleSelect.value.length === 0
    ) {
      hideElement(item);
    } else {
      addRemoveButton(item);
    }
  }
}

function removeRegulator(event) {
  const button = event.target;
  const container = button.parentElement;

  hideElement(container);

  container.querySelector('select.organisation').value = '';
  container.querySelector('select.role').value = '';

  button.remove();

  event.preventDefault();
}

function hideElement(element) {
  element.classList.add('govuk-visually-hidden');
  element.setAttribute('aria-hidden', true);
}

function showElement(element) {
  element.classList.remove('govuk-visually-hidden');
  element.setAttribute('aria-hidden', false);
}

export function regulatoryAuthoritySelect() {
  const items = document.querySelectorAll(regulatoryAuthorityContainerSelector);
  const addButton = document.querySelector('#add-regulator');

  if (items.length == 0) return;

  initialize(items);

  showElement(addButton);

  addButton.addEventListener('click', showRegulator);
}
