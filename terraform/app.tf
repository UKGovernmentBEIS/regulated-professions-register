# Create the web app.

resource "cloudfoundry_app" "beis-rpr-app" {
  name         = "beis-rpr-${var.environment}"
  space        = cloudfoundry_space.space.id
  instances    = 2
  disk_quota   = 3072
  timeout      = 300
  docker_image = "ghcr.io/ukgovernmentbeis/regulated-professions-register:${var.docker_tag}"
  strategy                   = "blue-green-v2"
  health_check_http_endpoint = "/"
  service_binding { service_instance = cloudfoundry_service_instance.beis-rpr-postgres.id }
  service_binding { service_instance = cloudfoundry_service_instance.beis-rpr-opensearch.id }
  service_binding { service_instance = cloudfoundry_user_provided_service.papertrail.id }
  service_binding { service_instance = cloudfoundry_service_instance.beis-rpr-redis.id }
  environment = {
    "AUTH0_CLIENT_ID"     = var.auth0_client_id
    "AUTH0_CLIENT_SECRET" = var.auth0_client_secret
    "AUTH0_DOMAIN"        = var.auth0_domain
    "AUTH0_REDIRECT_URL"  = var.auth0_redirect_url
    "APP_SECRET"          = var.app_secret
    "HOST_URL"            = "https://${var.custom_hostname}.${var.custom_domain}/"
    "CANONICAL_HOSTNAME"  = "${var.custom_hostname}.${var.custom_domain}"
    "NOTIFY_TEMPLATE_ID"  = var.notify_template_id
    "NOTIFY_API_KEY"      = var.notify_api_key
    "ENVIRONMENT"         = var.environment
    "ROLLBAR_TOKEN"       = var.rollbar_token
    "BASIC_AUTH_USERNAME" = var.basic_auth_username
    "BASIC_AUTH_PASSWORD" = var.basic_auth_password
    "REGULATOR_FEEDBACK_URL" = var.regulator_feedback_url
  }
  # routes need to be declared with the app for blue green deployments to work
  routes {
    route = cloudfoundry_route.beis-rpr-route.id
  }
  routes {
    route = cloudfoundry_route.beis-rpr-custom-domain-route.id
  }

}
