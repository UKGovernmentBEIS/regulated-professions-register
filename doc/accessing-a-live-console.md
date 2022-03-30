# Accessing a live console

We need console access to bootstrap the service and occasionally running data migrations. We may
need a way to access live environments for debugging or incident management purposes.

## Prerequisites

You must have an account that has been invited to the Government Platform as a Service (GPaaS) account. Developers from the product team should be able to invite you. dxw team members can use the credentials stored in 1Password under `GOV.UK PaaS Service Account`.

You must have have been given 'Space developer' access to the intended space, for example "prod".

[You can sign in to check your account and permissions here](https://admin.london.cloud.service.gov.uk).

## Access

1. From a local terminal login to Cloud Foundry and select the intended space

   ```bash
   $ cf login
   ```

2. Connect to the environment (in this case production)

   ```bash
   $ cf ssh beis-rpr-prod
   ```

3. CD to the correct location

   ```bash
   $ cd /srv/app
   ```

4. If you are running NPM commands, use `script/npm`, which adds the `npm` command to the PATH
