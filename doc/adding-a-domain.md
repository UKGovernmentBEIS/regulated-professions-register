# Adding a domain

All of our infrastructure is managed with [Terraform](https://github.com/UKGovernmentBEIS/regulated-professions-register/tree/main/terraform),
and in most cases, any infrastructure changes are applied automatically. There is one
exception though, when setting up domains.

To set up a domain, we first need to set up a CDN route. [This PR](https://github.com/UKGovernmentBEIS/regulated-professions-register/pull/308)
is a good example of how to set this up.

Once this is set up and the deploy runs, the deployment will time out. This is because
GOV.UK PaaS is waiting for the domain to become active. We can't make the domain active
without the DNS settings being set.

To do this, on your local machine, log into GOV.UK PaaS:

```bash
cf login
```

And run the following command:

```bash
cf service NAME
```

Where `NAME` is the name of the route service set in `routes.tf`.

The output will look something like:

```bash
status:    Create in progress
message:   Provisioning in progress.

Create the following CNAME records to direct traffic from your domains to your CDN route
www.example.com => d3j6yjt78pkdqf.cloudfront.net
www.example.net => d3j6yjt78pkdqf.cloudfront.net

To validate ownership of the domain, set the following DNS records
For domain www.example.com, set DNS record

    Name:  _83878ed284b0b5fcaa3e99a618432ac8.www.example.com.
    Type:  CNAME
    Value: _5c7e8297b9691c59197e4e10b5bf0a98.tfmgdnztqk.acm-validations.aws.
    TTL:   86400

    Current validation status of www.example.com: PENDING_VALIDATION

For domain www.example.net, set DNS record

    Name:  _87fa63d9b29059b0649695eec2cd0fbe.www.example.net.
    Type:  CNAME
    Value:  _6504c2f15bb9307ee3a599c0e8193849.tfmgdnztqk.acm-validations.aws.
    TTL:   86400

    Current validation status of www.example.net: PENDING_VALIDATION

started:   2020-06-05T09:28:34Z
updated:   2020-06-05T09:29:44Z
```

You'll then need to get the owner of the domain to set the DNS records.

In the case of the above example, there will be a CNAME for `www.example.com`
to go to `d3j6yjt78pkdqf.cloudfront.net`

And a CNAME record for `_83878ed284b0b5fcaa3e99a618432ac8.www.example.com.`, with
a value of `_5c7e8297b9691c59197e4e10b5bf0a98.tfmgdnztqk.acm-validations.aws.`
and a TTL of `86400`.

One the domain owner has done their bit, run:

```bash
cf service NAME
```

And you should see confirmation that the route has been created.

If you go back to Github Actions and try to re run the job, you'll now get
an error saying that the route has already been created. This is because
the last run timed out, but the Terraform state was not updated, so
Terraform is trying to create a resource that is already there.

To get around this, you now need to download the state locally and run
`terraform apply` locally.

Assuming you have `tfenv` and `terraform` installed, make a copy of the
`.env.ENVIRONMENT` file from the beis-rpr 1Password vault and put it in
the `/terraform` directory. Then run:

```bash
source .env.ENVIRONMENT
```

To load the relevant environment variables that Terraform needs.

Next run

```
terraform workspace select $ENVIRONMENT
```

to switch to the environment you want to deploy to in (where $ENVIRONMENT is
one of `prod` or `staging`).

Then we need to grab the ID of the cdn-route. First login to the GOV.UK
PaaS website, and navigate to beis-rpr > prod > Backing Services > beis-rpr-prod-cdn-route.
Grab the URL from the address bar. The ID is the last UUID in the URL:

```
https://admin.london.cloud.service.gov.uk/organisations/ORG_ID/spaces/SPACE_ID/services/SERVICE_ID
```

Copy this ID and then run the following in the command line:

```bash
terraform import cloudfoundry_service_instance.cdn_route SERVICE_ID
```

This will import our state from the infrastructure.

We can then run:

```bash
terraform plan
```

Assuming everything looks something like this:

```bash
Terraform will perform the following actions:

  # cloudfoundry_app.beis-rpr-app will be updated in-place
  ~ resource "cloudfoundry_app" "beis-rpr-app" {
      ~ environment                = (sensitive value)
        id                         = "9c718476-1602-499b-a254-80e7ba41aae8"
      ~ id_bg                      = "9c718476-1602-499b-a254-80e7ba41aae8" -> (known after apply)
        name                       = "beis-rpr-prod"
        # (15 unchanged attributes hidden)


        # (5 unchanged blocks hidden)
    }

  # cloudfoundry_service_instance.cdn_route will be updated in-place
  ~ resource "cloudfoundry_service_instance" "cdn_route" {
        id                             = "01fb5e91-722e-4526-b51e-ad50fbaa7729"
      + json_params                    = jsonencode(
            {
              + domain  = "www.regulated-professions.beis.gov.uk"
              + headers = [
                  + "*",
                ]
            }
        )
        name                           = "beis-rpr-prod-cdn-route"
      + recursive_delete               = false
        tags                           = []
        # (4 unchanged attributes hidden)

        # (1 unchanged block hidden)
    }

Plan: 0 to add, 2 to change, 0 to destroy.
```

Then we can happily run

```bash
terraform apply
```

And our new domain will be available.
