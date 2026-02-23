# OurCalendar GCP Infrastructure

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

# Cloud SQL PostgreSQL instance
resource "google_sql_database_instance" "main" {
  name             = "ourcalendar-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled = false
      private_network = google_compute_network.vpc.id
    }

    backup_configuration {
      enabled = true
    }
  }

  deletion_protection = true

  depends_on = [google_project_service.services]
}

resource "google_sql_database" "database" {
  name     = "ourcalendar"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "user" {
  name     = "ourcalendar"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# VPC for private Cloud SQL access
resource "google_compute_network" "vpc" {
  name                    = "ourcalendar-vpc"
  auto_create_subnetworks = true
}

# VPC Connector for Cloud Run to access Cloud SQL
resource "google_vpc_access_connector" "connector" {
  name          = "ourcalendar-connector"
  region        = var.region
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.vpc.name
}

# Cloud Run service
resource "google_cloud_run_v2_service" "api" {
  name     = "ourcalendar-api"
  location = var.region

  template {
    containers {
      image = "gcr.io/${var.project_id}/ourcalendar-api:latest"

      env {
        name  = "ENV"
        value = "production"
      }

      env {
        name  = "GOOGLE_CLIENT_ID"
        value = var.google_client_id
      }

      # SUPABASE_URL is the PostgreSQL connection string used by the backend
      env {
        name = "SUPABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.supabase_url.secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt_secret.secret_id
            version = "latest"
          }
        }
      }
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }
  }

  depends_on = [google_project_service.services]
}

# Allow unauthenticated access
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.api.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Secret Manager: SUPABASE_URL (PostgreSQL connection string)
resource "google_secret_manager_secret" "supabase_url" {
  secret_id = "supabase-url"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "supabase_url" {
  secret = google_secret_manager_secret.supabase_url.id
  # Format: postgresql://ourcalendar:PASSWORD@PRIVATE_IP:5432/ourcalendar
  secret_data = "postgresql://${google_sql_user.user.name}:${var.db_password}@${google_sql_database_instance.main.private_ip_address}:5432/${google_sql_database.database.name}"
}

# Secret Manager: JWT Secret
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"

  replication {
    auto {}
  }

  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}
