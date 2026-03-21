variable "project_name" { type = string }
variable "environment" { type = string }
variable "tags" { type = map(string) }

output "terminal_repository_url" {
  description = "Placeholder ECR repository URL for terminal sandbox image."
  value       = "${var.project_name}-${var.environment}-sandbox-terminal"
}

