# Create the web app.

resource "cloudfoundry_app" "beis-rpr-redirect" {
  name         = "beis-rpr-redirect-${var.environment}"
  space        = cloudfoundry_space.space.id
  instances    = 2
  disk_quota   = 1024
  memory       = 256
  timeout      = 300
  docker_image = "ghcr.io/ukgovernmentbeis/regulated-professions-register-redirect:${var.docker_tag}"
  strategy                   = "blue-green-v2"
  health_check_http_endpoint = "/"
  environment = {
    "REDIRECT_TARGET"            = "https://${var.custom_hostname}.${var.custom_domain}"
  }
  routes {
    route = cloudfoundry_route.beis-rpr-redirect-route.id
  }

}
