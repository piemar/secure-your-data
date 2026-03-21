variable "project_name" { type = string }
variable "environment" { type = string }
variable "tags" { type = map(string) }

output "runtime_role_name" {
  description = "Placeholder IAM role name for sandbox runtime."
  value       = "${var.project_name}-${var.environment}-sandbox-runtime-role"
}

