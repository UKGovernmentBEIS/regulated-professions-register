# Create the web app.

resource "cloudfoundry_app" "beis-rpr-app" {
  name                       = "beis-rpr-${var.environment}"
  space                      = cloudfoundry_space.space.id
  instances                  = 2
  disk_quota                 = 3072
  timeout                    = 300
  docker_image = "thedxw/beis-rpr:${var.docker_tag}"
  docker_credentials = {
    username = var.docker_username
    password = var.docker_password
  }
  strategy                   = "blue-green-v2"
  health_check_http_endpoint = "/"
  service_binding { service_instance = cloudfoundry_service_instance.beis-rpr-postgres.id }
  environment = {
    "AUTH0_CLIENT_ID"     = var.auth0_client_id
    "AUTH0_CLIENT_SECRET" = var.auth0_client_secret
    "AUTH0_DOMAIN"        = var.auth0_domain
    "AUTH0_REDIRECT_URL"  = var.auth0_redirect_url
    "APP_SECRET"          = var.app_secret
    "AUTH_USERNAME"       = var.auth_username
    "AUTH_PASSWORD"       = var.auth_password
    "HOST_URL"            = var.host_url
  }
  # routes need to be declared with the app for blue green deployments to work
  routes {
    route = cloudfoundry_route.beis-rpr-route.id
  }

}
