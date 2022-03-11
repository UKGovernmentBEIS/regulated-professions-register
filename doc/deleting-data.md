# Deleting data

You may need to delete data in staging or production, for example, to re-upload
the latest data from scratch.

## How to

Once you've got the go-ahead to clear data from an environment, log into Auth0
and delete all accounts other than those present in `seeds/staging/users.json`.

Log into the GOV.UK PaaS and select the space that matches the environment
where you want to clear the data when prompted:

```bash
cf login
```

SSH into the container (where `$ENVIRONMENT` is one of `prod` or `staging`):

```bash
cf ssh beis-rpr-$ENVIRONMENT
```

CD into the app's home directory:

```bash
cd /srv/app
```

Install dev dependencies so you can run TypeORM commands with npm:

```bash
script/npm install --production=false
```

Run the TypeORM schema drop command to wipe the database:

```bash
script/npm run typeorm -- schema:drop
```

You'll then need to re-import the data, and log in as the `beis-rpr`
administrator user account (credentials in 1Password) and re-create the user
accounts.
