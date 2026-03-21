variable "project_name" { type = string }
variable "environment" { type = string }
variable "tags" { type = map(string) }

output "api_endpoint" {
  description = "Placeholder API endpoint; replace with ALB DNS output."
  value       = "https://api.${var.project_name}.${var.environment}.example.com"
}

