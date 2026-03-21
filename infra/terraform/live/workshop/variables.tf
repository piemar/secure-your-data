variable "aws_region" {
  description = "AWS region for workshop ephemeral stack."
  type        = string
}

variable "environment" {
  description = "Environment name (dev/stage/prod)."
  type        = string
}

variable "project_name" {
  description = "Project identifier used in names/tags."
  type        = string
  default     = "mongodb-gameday"
}

variable "tenant_id" {
  description = "Tenant id used for workshop scoping."
  type        = string
}

variable "workshop_id" {
  description = "Workshop id for this ephemeral stack."
  type        = string
}

variable "expires_at" {
  description = "ISO8601 expiration timestamp used by scheduled cleanup."
  type        = string
}

variable "tags" {
  description = "Extra tags merged into all resources."
  type        = map(string)
  default     = {}
}

