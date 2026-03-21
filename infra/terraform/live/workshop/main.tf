locals {
  workshop_tags = merge(
    {
      app         = var.project_name
      plane       = "sandbox"
      environment = var.environment
      tenant_id   = var.tenant_id
      workshop_id = var.workshop_id
      expires_at  = var.expires_at
      managed_by  = "terraform"
    },
    var.tags
  )
}

module "workshop_network_overlay" {
  source       = "../../modules/workshop-stack/workshop_network_overlay"
  project_name = var.project_name
  environment  = var.environment
  tenant_id    = var.tenant_id
  workshop_id  = var.workshop_id
  tags         = local.workshop_tags
}

module "workshop_runtime" {
  source       = "../../modules/workshop-stack/workshop_runtime"
  project_name = var.project_name
  environment  = var.environment
  tenant_id    = var.tenant_id
  workshop_id  = var.workshop_id
  tags         = local.workshop_tags
}

module "workshop_registry_binding" {
  source       = "../../modules/workshop-stack/workshop_registry_binding"
  project_name = var.project_name
  environment  = var.environment
  tenant_id    = var.tenant_id
  workshop_id  = var.workshop_id
  expires_at   = var.expires_at
  tags         = local.workshop_tags
}

