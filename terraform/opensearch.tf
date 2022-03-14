# Get data about the opensearch service on the PaaS
# so we can get the guid of the service plan we want to use.
data "cloudfoundry_service" "opensearch" {
  name = "opensearch"
}

# Create an opensearch instance named with the environment.

resource "cloudfoundry_service_instance" "beis-rpr-opensearch" {
  name                           = "beis-rpr-${var.environment}-opensearch"
  space                          = cloudfoundry_space.space.id
  service_plan                   = data.cloudfoundry_service.opensearch.service_plans["small-ha-1"]
  replace_on_params_change       = false
  replace_on_service_plan_change = false
}
