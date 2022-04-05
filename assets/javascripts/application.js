import { initAll } from 'govuk-frontend';
import Plausible from 'plausible-tracker';
import { regulatoryAuthoritySelect } from './regulatory-authority-select';

const { enableAutoPageviews } = Plausible();

initAll();
enableAutoPageviews();
regulatoryAuthoritySelect();

const detailsHeaderElements = document.getElementsByClassName(
  'rpr-listing__filters-container rpr-listing__filters--searched',
);
const detailsHeader = detailsHeaderElements[0];

if (window.screen.width < 480 && detailsHeader) {
  detailsHeader.removeAttribute('open');
}
