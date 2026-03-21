variable "project_name" { type = string }
variable "environment" { type = string }
variable "tags" { type = map(string) }

output "distribution_id" {
  description = "Placeholder CloudFront distribution id."
  value       = "${var.project_name}-${var.environment}-frontend"
}

