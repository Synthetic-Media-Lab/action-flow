#!/bin/bash

set -a
source .env.cicd.local
set +a

cleanup() {
    echo "Cleaning up SSL certificate files..."
    rm -f server-ca.pem client-cert.pem client-key.pem client-identity.p12
}

# Trap to execute cleanup function on script exit
trap cleanup EXIT

echo "Deploying to Cloud Run [PROD] ..."

gcloud run deploy action-flow-kh \
    --platform managed \
    --region $GC_REGION \
    --project $GC_PROJECT_ID \
    --service-account af-kh-service-acc-prod@action-flow-kh.iam.gserviceaccount.com \
    --source . \
    --no-allow-unauthenticated

if [ $? -ne 0 ]; then
    echo "Cloud Run deployment failed."
    exit 1
fi

echo "Deployment to Cloud Run [PROD] completed successfully."
