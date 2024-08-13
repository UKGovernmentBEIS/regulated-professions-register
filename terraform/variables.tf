variable "environment" {
  type        = string
  description = "the environment the app is running in"
}

variable "auth0_client_id" {
  type        = string
  description = "AUTH0 Client ID"
}

variable "auth0_client_secret" {
  type        = string
  description = "AUTH0 Client Secret"
}

variable "auth0_domain" {
  type        = string
  description = "AUTH0 domain"
}

variable "auth0_redirect_url" {
  type        = string
  description = "AUTH0 redirect url"
}

variable "app_secret" {
  type        = string
  description = "App Secret"
}

variable "docker_tag" {
  type        = string
  description = "The Docker tag to be pushed"
}

variable "papertrail_destination" {
  type        = string
  description = "Where to send logs hostname:port"
}

variable "notify_template_id" {
  type = string
  description = "The template ID to use when sending emails via Notify"
}

variable "notify_api_key" {
  type = string
  description = "The GOV.UK Notify API key"
}

variable "rollbar_token" {
  type = string
  description = "The access token to use when sending Rollbar errors"
}

variable "basic_auth_username" {
  type = string
  description = "The username we use for basic authentication if we want to hide the site from the public"
}

variable "basic_auth_password" {
  type = string
  description = "The password we use for basic authentication if we want to hide the site from the public"
}

variable "custom_domain" {
  type        = string
  description = "Name of custom domain created in the cf org"
}

variable "redirect_domain" {
  type        = string
  description = "The domain from which you want to redirect traffic"
}

variable "custom_hostname" {
  type        = string
  description = "Custom hostname (prepended to custom_domain for the app and cdn-route)"
}

variable "ga_tag" {
  type = string
  description = "The tag used by Google Analytics"
}

variable "gtm_tag" {
  type = string
  description = "The tag used by Google Tag Manager"
}

variable "regulator_feedback_url" {
  type = string
  description = "The feedback url to be used on the regulator page"
}
