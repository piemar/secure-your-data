variable "project_name" { type = string }
variable "environment" { type = string }
variable "tags" { type = map(string) }

output "dashboard_name" {
  description = "Placeholder dashboard name."
  value       = "${var.project_name}-${var.environment}-overview"
}

