#!/bin/bash
set -e

# OurCalendar GCP Setup Script

if [ -z "$PROJECT_ID" ]; then
  echo "Error: PROJECT_ID environment variable is not set"
  exit 1
fi

echo "Setting up GCP project: $PROJECT_ID"

# Set project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  containerregistry.googleapis.com

# Create Cloud Build trigger
echo "Creating Cloud Build trigger..."
gcloud builds triggers create github \
  --name="ourcalendar-api-deploy" \
  --repo-name="OurCalendar" \
  --repo-owner="$GITHUB_OWNER" \
  --branch-pattern="^main$" \
  --build-config="backend/cloudbuild.yaml" \
  --description="Deploy OurCalendar API to Cloud Run" \
  || echo "Trigger may already exist"

echo "Setup complete!"
