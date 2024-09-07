# CI/CD Pipeline Documentation for Action Flow

[← Back to Main Documentation](../README.md)

![Screenshot](https://i.ibb.co/56zCWyF/Screenshot-2024-09-05-at-11-15-36.png)

## Overview

This project uses **GitHub Actions** to automate the process of testing, building, and deploying your NestJS application to **Google Cloud Run**. The pipeline runs on every push to the `main` branch, ensuring that any changes to the codebase are tested and automatically deployed.

The pipeline covers:

-   Linting and formatting fixes
-   Running unit tests
-   Building a Docker image for the service
-   Deploying to Google Cloud Run

## CI/CD Workflow

The CI/CD pipeline is defined in the `.github/workflows/deploy.yml` file. Here’s what it does:

1. **Checkout Repository**: Pulls the latest code from the repository.
2. **Set Up Node.js**: Configures Node.js (version 20) for the environment.
3. **Install Dependencies**: Uses `pnpm` to install project dependencies.
4. **Run Lint and Format Fixes**: Automatically fixes linting and formatting issues.
5. **Run Tests**: Runs the Jest test suite to ensure code integrity.
6. **Authenticate with Google Cloud**: Uses service account credentials to authenticate with Google Cloud.
7. **Build Docker Image**: Builds the Docker image for the service and pushes it to Google Artifact Registry.
8. **Deploy to Cloud Run**: Deploys the built image to **Google Cloud Run** using the defined region and service account.

## Getting Started

### Prerequisites

Before using the CI/CD pipeline, follow these steps:

### 1. Set up Google Cloud

-   Ensure you have a **Google Cloud Project**.
-   Enable **Google Cloud Run** and **Google Artifact Registry**.
-   Create a **Service Account** with the following roles:
    -   Cloud Run Admin
    -   Artifact Registry Writer
    -   Logs Writer
    -   Storage Admin
    -   Secret Manager Secret Accessor
    -   Service Account User. (To ensure the Service Account has the `iam.serviceAccounts.actAs` permission, so Github Actions interact with GCP.)

### 2. Add Secrets in GitHub

In the repository settings, go to **Settings** → **Secrets and Variables** → **Actions** → **Secrets**, and add the following:

-   **`GCP_SERVICE_ACCOUNT_KEY`**: The JSON key for the Google Cloud service account.
-   **`GCP_SERVICE_ACCOUNT_EMAIL`**: The email address of the service account.

### 3. Add GitHub Environment Variables

In the same **Settings** → **Secrets and Variables** → **Actions** → **Variables**, add the following **environment variables**:

-   **`GCP_PROJECT_ID`**: Your Google Cloud project ID (e.g., `action-flow-kh`).
-   **`GCP_REGION`**: Your Google Cloud region for deployment (e.g., `europe-north1`).

### 4. Trigger the Workflow

Once these variables and secrets are set up, the pipeline will automatically trigger on every push to the `main` branch. You can manually trigger it by pushing a new commit or re-running a previous workflow from the GitHub Actions tab.

## Workflow Breakdown

-   **Linting and Formatting**: The pipeline runs `pnpm lint:fix` and `pnpm format:fix` to automatically fix linting and formatting errors.
-   **Testing**: The `pnpm test` command is used to run the test suite using Jest.
-   **Build and Deploy**: The Docker image is built and pushed to Google Artifact Registry, then deployed to Google Cloud Run using the `gcloud run deploy` command.

## Troubleshooting

1. **Permission Issues**: Ensure the service account has the correct roles and permissions, especially `iam.serviceAccounts.actAs` and `Cloud Run Admin`.
2. **Secrets**: Double-check that the secrets are correctly defined in GitHub.
3. **Deployment Errors**: You can check the deployment logs in the **Google Cloud Console** under Cloud Run to troubleshoot deployment failures.

## Summary

This CI/CD pipeline automates testing, building, and deploying your application to Google Cloud Run. It is triggered on every push to the `main` branch, ensuring a smooth and automated development workflow.

---

[← Back to Main Documentation](../README.md)
