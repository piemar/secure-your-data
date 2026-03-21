locals {
  common_tags = merge(
    {
      app         = var.project_name
      plane       = "control"
      environment = var.environment
      managed_by  = "terraform"
    },
    var.tags
  )
}

module "frontend_cdn" {
  source       = "../../modules/control-plane/frontend_cdn"
  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

module "app_api_service" {
  source       = "../../modules/control-plane/app_api_service"
  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

module "secrets" {
  source       = "../../modules/control-plane/secrets"
  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

module "observability" {
  source       = "../../modules/control-plane/observability"
  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

module "atlas_cluster" {
  source             = "../../modules/control-plane/atlas_cluster"
  project_name       = var.project_name
  environment        = var.environment
  tags               = local.common_tags
  atlas_enabled      = var.atlas_enabled
  atlas_project_name = var.atlas_project_name
  atlas_cluster_name = var.atlas_cluster_name
}

