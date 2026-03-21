variable "aws_region" {
  description = "AWS region for shared sandbox infrastructure."
  type        = string
}

variable "environment" {
  description = "Environment name (dev/stage/prod)."
  type        = string
}

variable "project_name" {
  description = "Project identifier used in names/tags."
  type        = string
  default     = "mongodb-gameday"
}

variable "tags" {
  description = "Extra tags merged into all resources."
  type        = map(string)
  default     = {}
}

