#!/bin/bash
set -e

# Local deployment script for testing

PROJECT_ID=${PROJECT_ID:-$(gcloud config get-value project)}
REGION=${REGION:-asia-northeast1}
IMAGE_TAG=${IMAGE_TAG:-latest}

echo "Deploying to project: $PROJECT_ID"

# Build and push image
echo "Building Docker image..."
cd "$(dirname "$0")/../../backend"

docker build -t gcr.io/$PROJECT_ID/ourcalendar-api:$IMAGE_TAG .

echo "Pushing to Container Registry..."
docker push gcr.io/$PROJECT_ID/ourcalendar-api:$IMAGE_TAG

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ourcalendar-api \
  --image gcr.io/$PROJECT_ID/ourcalendar-api:$IMAGE_TAG \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated

echo "Deployment complete!"
