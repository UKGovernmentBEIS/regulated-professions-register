# Uploading seed data

From time to time, you may need to upload seed data to staging or production.

## Prerequsites

You need seed data in the format presented in the `/seeds` directory. This will,
more often than not, be prepared by the Ruby script in https://github.com/UKGovernmentBEIS/regulated-professions-data.

## How to

Make sure you are in the directory that contains the seed files you want to upload.

Log into the GOV.UK PaaS and select the space that matches the environment where
you want to upload the data when prompted:

```bash
cf login
```

Upload the json files to the staging/prod container (where `$ENVIRONMENT` is one
of `prod` or `staging`):

```bash
for file in *.json; do
cat $file | cf ssh beis-rpr-$ENVIRONMENT -c "cat > $file"
done
```

SSH into the container (again, where `$ENVIRONMENT` is one of `prod` or `staging`):

```bash
cf ssh beis-rpr-$ENVIRONMENT
```

Copy the files you've uploaded to the relevant seed directory (once again, where
`$ENVIRONMENT` is one of `prod` or `staging`):

```bash
cp *.json /srv/app/seeds/$ENVIRONMENT/
```

CD into the app's home directory:

```bash
cd /srv/app
```

Run the seed command:

```bash
script/seed
```

This will seed the database with the up to date data.
