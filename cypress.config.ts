import { defineConfig } from 'cypress';

export default defineConfig({
  experimentalSessionAndOrigin: true,
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.ts').default(on, config);
    },
    baseUrl: 'http://localhost:3000',
  },
});
