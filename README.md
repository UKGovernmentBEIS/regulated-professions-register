# Regulated Professions Register

Some professions are regulated in the UK, or parts of the UK. This means you
may need certain qualifications or experience before working in them.

The Regulated Professions Register (RPR) allows professionals to:

- check if a profession is regulated
- check the requirements for practising a profession
- find the contact details of the regulator or professional body for a
  particular profession

You may need to do this if you:

- gained your qualifications overseas and want to work in the UK
- qualified in a certain area of the UK, like England, and want to work in a
  different area, like Scotland
- want to work in a regulated profession for the first time
- are thinking about becoming a member of a professional body

## Setup

Run the setup command. This drops and recreates the database, installs any
dependencies, runs the DB migrations, and builds the assets:

```
script/setup
```

If this is your first time running the project or you haven't run it in a
while, you'll need to populate your newly-created `.env.development` file with
secrets stored in the ".env.development" entry in the BEIS RPR directory in
1Password.

To just update dependencies and database seeds, you can run the bootstrap
command:

```
script/bootstrap
```

## Running the application

To run the server, from the root directory, run:

```
script/server
```

This runs the server on `localhost:3000`.

## Running the tests

To run linting, unit and end-to-end tests, from the root directory, run:

```
script/test
```

## Rebuilding the assets

If you make any changes to the assets, run:

```
npm run build:assets
```

## Architecture decision records

We use ADRs to document architectural decisions that we make. They can be found in `doc/architecture/decisions` and contributed to with the [adr-tools](https://github.com/npryce/adr-tools).

## Access

### Staging

The staging environment is hosted on GPaas: https://staging.regulated-professions.beis.gov.uk

The public pages (anything other than `/admin/*`) are currently behind basic authentication. Credentials for this are stored under "Staging basic auth" in the BEIS RPR 1Password vault.

The `main` branch is deployed to staging after a successful build via GitHub Actions.

### Production

The production environment is hosted on GPaas: https://www.regulated-professions.beis.gov.uk

The public pages (anything other than `/admin/*`) are currently behind basic authentication. Credentials for this are stored under "Prod basic auth" in the BEIS RPR 1Password vault.

Production deployments are triggered manually from the `main` branch. See [deployments](./doc/deployment.md) for more details.

## Documentation

[Detailed documentation](./doc/0_front-line-support.md) for developers and support staff is found in `doc/`.
