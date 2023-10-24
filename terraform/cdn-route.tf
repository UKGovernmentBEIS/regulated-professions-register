data "cloudfoundry_service" "cdn_route" {
  name = "cdn-route"
}

resource "cloudfoundry_service_instance" "cdn_route" {
  name         = "beis-rpr-${var.environment}-cdn-route"
  space        = cloudfoundry_space.space.id
  service_plan = data.cloudfoundry_service.cdn_route.service_plans["cdn-route"]
  json_params  = <<EOF
{"domain": "${var.custom_hostname}.${var.custom_domain}", "headers": ["*"]}
EOF
}

resource "cloudfoundry_service_instance" "cdn_redirect_route" {
  name         = "beis-rpr-${var.environment}-redirect-cdn-route"
  space        = cloudfoundry_space.space.id
  service_plan = data.cloudfoundry_service.cdn_route.service_plans["cdn-route"]
  json_params  = <<EOF
{"domain": "${var.custom_hostname}.${var.redirect_domain}", "headers": ["*"]}
EOF
}

// CDN Route for root redirect domain - prod only
resource "cloudfoundry_service_instance" "cdn_redirect_root_route" {
  count       = var.environment == "prod" ? 1 : 0
  name         = "beis-rpr-${var.environment}-redirect-root-cdn-route"
  space        = cloudfoundry_space.space.id
  service_plan = data.cloudfoundry_service.cdn_route.service_plans["cdn-route"]
  json_params  = <<EOF
{"domain": "${var.redirect_domain}", "headers": ["*"]}
EOF
}
