import { initAll } from 'govuk-frontend';
import Plausible from 'plausible-tracker';

const { enableAutoPageviews } = Plausible();

initAll();
enableAutoPageviews();
