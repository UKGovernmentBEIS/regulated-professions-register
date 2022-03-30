# Regulated Professions Register

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

```
script/server
```

## Running the tests

```
script/test
```

## Rebuilding the assets

If you make any changes to the assets, run:

```
npm run build:assets
```
