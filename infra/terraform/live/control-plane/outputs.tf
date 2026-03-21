output "control_plane_tags" {
  description = "Resolved control-plane tags."
  value       = local.common_tags
}

output "frontend_distribution_id" {
  description = "CloudFront distribution id placeholder."
  value       = module.frontend_cdn.distribution_id
}

output "api_endpoint" {
  description = "API endpoint placeholder."
  value       = module.app_api_service.api_endpoint
}

output "atlas_cluster_planned_name" {
  description = "Resolved central Atlas cluster name for control-plane."
  value       = module.atlas_cluster.atlas_cluster_name_effective
}

