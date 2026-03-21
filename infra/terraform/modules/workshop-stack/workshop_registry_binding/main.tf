variable "project_name" { type = string }
variable "environment" { type = string }
variable "tenant_id" { type = string }
variable "workshop_id" { type = string }
variable "expires_at" { type = string }
variable "tags" { type = map(string) }

output "registry_key" {
  description = "Placeholder registry key for workshop lifecycle automation."
  value       = "${var.project_name}/${var.environment}/${var.tenant_id}/${var.workshop_id}"
}

