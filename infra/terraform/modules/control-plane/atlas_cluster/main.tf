variable "project_name" { type = string }
variable "environment" { type = string }
variable "tags" { type = map(string) }

variable "atlas_enabled" {
  description = "Whether central Atlas provisioning is enabled."
  type        = bool
  default     = false
}

variable "atlas_project_name" {
  description = "Atlas project name to create/use."
  type        = string
  default     = ""
}

variable "atlas_cluster_name" {
  description = "Atlas cluster name to create/use."
  type        = string
  default     = ""
}

output "atlas_bootstrap_required" {
  description = "True when Atlas provisioning is enabled and should be implemented in this module."
  value       = var.atlas_enabled
}

output "atlas_project_name_effective" {
  description = "Resolved Atlas project name."
  value       = var.atlas_project_name != "" ? var.atlas_project_name : "${var.project_name}-${var.environment}"
}

output "atlas_cluster_name_effective" {
  description = "Resolved Atlas cluster name."
  value       = var.atlas_cluster_name != "" ? var.atlas_cluster_name : "${var.project_name}-${var.environment}-central"
}

