# Create a route for the app using the default domain
# and useful hostname based on environment
resource "cloudfoundry_route" "beis-rpr-route" {
  domain   = data.cloudfoundry_domain.default.id
  space    = cloudfoundry_space.space.id
  hostname = "beis-rpr-${var.environment}"
}

# Create a route for the app using the default domain
# and useful hostname provided from tfvars (which allows us to easily set www for prod)
resource "cloudfoundry_route" "beis-rpr-custom-domain-route" {
  domain   = data.cloudfoundry_domain.custom.id
  space    = cloudfoundry_space.space.id
  hostname = var.custom_hostname
}

# Create a route for the app using the redirect domain
# and useful hostname provided from tfvars (which allows us to easily set www for prod)
resource "cloudfoundry_route" "beis-rpr-redirect-route" {
  domain   = data.cloudfoundry_domain.redirect.id
  space    = cloudfoundry_space.space.id
  hostname = join("", [var.custom_hostname, "_redirect"])
}
