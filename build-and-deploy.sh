#!/bin/bash

# Load environment variables (if any)
set -a
source .env
set +a

# Set the Google Cloud project ID and region (replace with your actual values)
GC_PROJECT_ID=your-gcp-project-id
GC_REGION=your-gcp-region

# Deploy to Google Cloud Run
gcloud run deploy action-flow \
    --platform managed \
    --region $GC_REGION \
    --project $GC_PROJECT_ID \
    --source .

if [ $? -ne 0 ]; then
    echo "Cloud Run deployment failed."
    exit 1
fi

echo "Deployment to Cloud Run completed successfully."
