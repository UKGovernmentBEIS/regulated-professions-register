# Create and use a S3 bucket in the terraform space of the BEIS org to store state
# cf create-space terraform
# cf target -s terraform
# cf create-service aws-s3-bucket default terraform-state
# cf create-service-key terraform-state terraform-state-key -c '{"allow_external_access": true}'
# cf service-key terraform-state terraform-state-key
# store the credentials in 1password
# set AWS_SECRET_ACCESS_KEY and AWS_ACCESS_KEY_ID

terraform {
  backend "s3" {
    key    = "terraform"
    bucket = "paas-s3-broker-prod-lon-ff1d10f6-b00f-4b73-9131-af87e71e25e0"
    region = "eu-west-2"
  }
  required_providers {
    cloudfoundry = {
      source  = "cloudfoundry-community/cloudfoundry"
      version = "0.15.0"
    }
  }
}

# Use the cloudfoundry provider
# CF_PASSWORD and CF_USER need to be set as environment variables
provider "cloudfoundry" {
  api_url = "https://api.london.cloud.service.gov.uk"
}
