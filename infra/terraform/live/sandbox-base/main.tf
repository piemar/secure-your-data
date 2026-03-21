locals {
  common_tags = merge(
    {
      app         = var.project_name
      plane       = "sandbox"
      environment = var.environment
      managed_by  = "terraform"
    },
    var.tags
  )
}

module "sandbox_cluster" {
  source       = "../../modules/sandbox-base/sandbox_cluster"
  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

module "sandbox_images" {
  source       = "../../modules/sandbox-base/sandbox_images"
  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

module "sandbox_roles" {
  source       = "../../modules/sandbox-base/sandbox_roles"
  project_name = var.project_name
  environment  = var.environment
  tags         = local.common_tags
}

