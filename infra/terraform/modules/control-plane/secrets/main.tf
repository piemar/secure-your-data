variable "project_name" { type = string }
variable "environment" { type = string }
variable "tags" { type = map(string) }

output "secret_namespace" {
  description = "Secret namespace prefix for this environment."
  value       = "/${var.project_name}/${var.environment}"
}

