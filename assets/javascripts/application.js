import { initAll } from 'govuk-frontend';
import { regulatoryAuthoritySelect } from './regulatory-authority-select';

initAll();
regulatoryAuthoritySelect();

const detailsHeaderElements = document.getElementsByClassName(
  'rpr-listing__filters-container rpr-listing__filters--searched',
);
const detailsHeader = detailsHeaderElements[0];

if (window.screen.width < 480 && detailsHeader) {
  detailsHeader.removeAttribute('open');
}
