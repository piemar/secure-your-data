variable "project_name" { type = string }
variable "environment" { type = string }
variable "tags" { type = map(string) }

output "cluster_name" {
  description = "Placeholder shared sandbox cluster name."
  value       = "${var.project_name}-${var.environment}-sandbox"
}

