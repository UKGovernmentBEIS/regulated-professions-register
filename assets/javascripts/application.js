import { initAll } from 'govuk-frontend';
import Plausible from 'plausible-tracker';

const { enableAutoPageviews } = Plausible();

initAll();
enableAutoPageviews();

const detailsHeaderElements = document.getElementsByClassName(
  'rpr-listing__filters-container rpr-listing__filters--searched',
);
const detailsHeader = detailsHeaderElements[0];

if (window.screen.width < 480 && detailsHeader) {
  detailsHeader.removeAttribute('open');
}
