variable "project_name" { type = string }
variable "environment" { type = string }
variable "tenant_id" { type = string }
variable "workshop_id" { type = string }
variable "tags" { type = map(string) }

output "network_overlay_id" {
  description = "Placeholder network overlay id for workshop stack."
  value       = "${var.project_name}-${var.environment}-${var.workshop_id}-net"
}

