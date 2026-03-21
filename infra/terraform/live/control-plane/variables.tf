variable "aws_region" {
  description = "AWS region for control-plane resources."
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

variable "tags" {
  description = "Extra tags merged into all resources."
  type        = map(string)
  default     = {}
}

variable "atlas_enabled" {
  description = "Enable central Atlas provisioning module wiring."
  type        = bool
  default     = false
}

variable "atlas_project_name" {
  description = "Optional explicit Atlas project name."
  type        = string
  default     = ""
}

variable "atlas_cluster_name" {
  description = "Optional explicit Atlas cluster name."
  type        = string
  default     = ""
}

