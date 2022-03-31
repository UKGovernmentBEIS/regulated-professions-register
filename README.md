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
