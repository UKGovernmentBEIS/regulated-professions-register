# Regulated Professions Register

## Setup

Run the setup command. This drops and recreates the database, installs any
dependencies, runs the DB migrations, and builds the assets:

```
script/setup
```

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
