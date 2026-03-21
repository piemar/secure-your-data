output "workshop_tags" {
  description = "Resolved workshop tags for this stack."
  value       = local.workshop_tags
}

output "workshop_runtime_id" {
  description = "Workshop runtime identifier placeholder."
  value       = module.workshop_runtime.runtime_id
}

output "workshop_registry_key" {
  description = "Workshop registry key placeholder."
  value       = module.workshop_registry_binding.registry_key
}

