output "sandbox_base_tags" {
  description = "Resolved sandbox-base tags."
  value       = local.common_tags
}

output "sandbox_cluster_name" {
  description = "Shared sandbox cluster name placeholder."
  value       = module.sandbox_cluster.cluster_name
}

output "sandbox_terminal_repository_url" {
  description = "ECR URL for terminal sandbox image placeholder."
  value       = module.sandbox_images.terminal_repository_url
}

