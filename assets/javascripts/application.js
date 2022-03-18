import { initAll } from 'govuk-frontend';
import Plausible from 'plausible-tracker';
import { populateBacklink } from './populate-backlink';

const { enableAutoPageviews } = Plausible();

initAll();
enableAutoPageviews();
populateBacklink();
