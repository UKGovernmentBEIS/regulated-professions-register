# Connecting to the database

You may on occasion need to connect directly to the database in order to view or manipulate data.

## Prerequisites

You must have an account that has been invited to the Government Platform as a Service (GPaaS) account. Developers from the product team should be able to invite you.

You must have have been given 'Space developer' access to the intended space, for example "prod".

[You can sign in to check your account and permissions here](https://admin.london.cloud.service.gov.uk).

You must have the [cloudfoundry cli](https://github.com/cloudfoundry/cli) installed.

You must have the `conduit` cloudfoundry plugin installed. To install this, run `cf install-plugin conduit`

## Access

1. From a local terminal login to Cloud Foundry and select the intended space

   ```bash
   $ cf login
   ```

2. Use conduit to connect to desired database service

   The below will connect to the production dabase in a read only capacity.

   ```bash
   $ cf conduit beis-rpr-prod-postgres -c '{"read_only": true}' -- psql
   ```

   In order to connect in a write capacity, remove the `-c` flag:

   ```bash
   $ cf conduit beis-rpr-prod-postgres -- psql
   ```
