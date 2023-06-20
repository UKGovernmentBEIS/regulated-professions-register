# Add / remove basic authentiation

The staging environment is currently locked behind basic authentiation. This is for if you wish to remove, or re-add this.

## Prerequisites
You must have an account that has been invited to the Government Platform as a Service (GPaaS) account. Developers from the product team should be able to invite you.

You must have have been given 'Space developer' access to the intended space, for example "prod".

[You can sign in to check your account and permissions here](https://admin.london.cloud.service.gov.uk).

You must have the [cloudfoundry cli](https://github.com/cloudfoundry/cli) installed.

You must have a GitHub login with rights to modify the [action secrets](https://github.com/UKGovernmentBEIS/regulated-professions-register/settings/secrets/actions).

## Remove credentials

1. From a local terminal login to Cloud Foundry and select the intended space

   ```bash
   $ cf login
   ```

1. Unset the variables used to store the credentials (update [VALUES])

   ```bash
   $ cf unset-env [APPLICATION] BASIC_AUTH_USERNAME
   $ cf unset-env [APPLICATION] BASIC_AUTH_PASSWORD
   ```

1. Remove the following variables from [GitHub Action Secrets](https://github.com/UKGovernmentBEIS/regulated-professions-register/settings/secrets/actions) (update [VALUES])

   ```
   [ENV]_BASIC_AUTH_PASSWORD
   [ENV]_BASIC_AUTH_USERNAME
   ```

1. Restage the application (update [VALUES]) **NOTE: This will cause a short outage whilst the application restarts**

   ```bash
   cf restage [APPLICATION]
   ```

## Apply credentials

There are two ways to apply credentials:
* As part of a release
* Using the `cf` CLI - **NOTE: This will require a short outage**

There is one step required for both methods

1. In [GitHub Action Secrets](https://github.com/UKGovernmentBEIS/regulated-professions-register/settings/secrets/actions), add the following variables with the desired credentials

   ```
   [ENV]_BASIC_AUTH_PASSWORD
   [ENV]_BASIC_AUTH_USERNAME
   ```

### Release process

Once the credentials are set in GitHub, deploy a release as per [deployment](./deployment.md).

### CLI process

1. From a local terminal login to Cloud Foundry and select the intended space

   ```bash
   $ cf login
   ```

1. Set the variables used to store the credentials (update [VALUES])

   ```bash
   $ cf set-env [APPLICATION] BASIC_AUTH_USERNAME [USERNAME]
   $ cf set-env [APPLICATION] BASIC_AUTH_PASSWORD [PASSWORD]
   ```

1. Restage the application (update [VALUES]) **NOTE: This will cause a short outage whilst the application restarts**

   ```bash
   cf restage [APPLICATION]
   ```
