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

variable "host_url" {
  type        = string
  description = "Host URL"
}

variable "docker_tag" {
  type        = string
  description = "The Docker tag to be pushed"
}

variable "docker_password" {
  type        = string
  description = "The Docker Hub user password"
}

variable "docker_username" {
  type        = string
  description = "The Docker Hub username"
}
