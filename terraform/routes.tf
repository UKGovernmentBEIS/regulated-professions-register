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
  hostname = var.custom_hostname
}

# Create a route for the app using the redirect domain
# not using hostname to allow the redirection of the root domain - only for production
resource "cloudfoundry_route" "beis-rpr-redirect-root-route" {
  count       = var.environment == "prod" ? 1 : 0
  domain      = data.cloudfoundry_domain.redirect.id
  space       = cloudfoundry_space.space.id
  depends_on  = [
    cloudfoundry_app.beis-rpr-redirect 
  ]
  target {
    app   = cloudfoundry_app.beis-rpr-redirect.id
  }
}
