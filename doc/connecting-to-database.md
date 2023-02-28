# Accessing a live console

To view and/or make changes to hosted data, it may be necessary to connect directly to the hosted Postgresql database.

## Prerequisites

You must have an account that has been invited to the Government Platform as a Service (GPaaS) account. Developers from the product team should be able to invite you. dxw team members can use the credentials stored in 1Password under `GOV.UK PaaS Service Account`.

You must have have been given 'Space developer' access to the intended space, for example "prod".

[You can sign in to check your account and permissions here](https://admin.london.cloud.service.gov.uk).

You must also have the [CloundFoundry CLI installed](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html)

## Access

1. From a local terminal login to Cloud Foundry and select the intended space

   ```bash
   $ cf login
   ```

2. Install conduit (if not currently installed)

   ```bash
   $ cf install-plugin conduit
   ```

3. Connect to database using condiut (READ ONLY)

   ```bash
   $ cf conduit beis-rpr-[env]-postgres -c '{"read_only": true}' -- psql
   ```

4. Connect to database using condiut (WRITE)

   ```bash
   $ cf conduit beis-rpr-[env]-postgres -- psql
   ```
