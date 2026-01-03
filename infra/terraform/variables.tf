variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "asia-northeast1"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
