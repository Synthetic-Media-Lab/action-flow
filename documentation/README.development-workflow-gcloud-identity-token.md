# Development Workflow: Google Cloud Identity Token

[← Back to Main Documentation](../README.md)

## Google Cloud Identity Token Generator

### Description

[This repository](https://github.com/dawid-dahl-umain/gcloud-identity-token-generator) provides a simple solution to generate Google Cloud Identity tokens locally for development use. These tokens can be used to authenticate API requests to secured Google Cloud Run services, allowing developers to test services using tools like Postman.

**Note**: This is strictly for **local use only**. Do not expose this service to external networks or use it in production environments due to potential security vulnerabilities.

### Prerequisites

Before getting started, ensure you have the following installed:

-   **Node.js** and **npm** (Node Package Manager)
-   **Google Cloud SDK** (`gcloud` command-line tool)
-   **Service Account Key**: A Google Cloud service account key in JSON format with the **Cloud Run Invoker** role.

### Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/dawid-dahl-umain/gcloud-identity-token-generator.git
cd gcloud-identity-token-generator
```

#### 2. Install Node Modules

```bash
npm install
```

#### 3. Create `.env.gcloud` Configuration File

1. Copy the provided `.env.gcloud.example` file and rename it to `.env.gcloud`:

    ```bash
    cp .env.gcloud.example .env.gcloud
    ```

2. In the `.env.gcloud` file, configure the following values:

    ```bash
    # Path to the service account JSON key file
    SERVICE_ACCOUNT_JSON=./path-to-your-service-account.json

    # Audience (the URL of the Cloud Run service you want to authenticate with)
    GCLOUD_IDENTITY_TOKEN_AUDIENCE=https://your-cloud-run-service-url
    ```

    - `SERVICE_ACCOUNT_JSON`: Path to your Google Cloud service account key file.
    - `GCLOUD_IDENTITY_TOKEN_AUDIENCE`: The URL of your Cloud Run service (e.g., `https://your-cloud-run-service-url`).

#### 4. Make the Shell Script Executable

Make the provided shell script executable so it can generate tokens:

```bash
chmod +x ./generate_gcloud_identity_token.sh
```

#### 5. Start the Token Generator Server

Run the server that will generate Google Cloud Identity tokens:

```bash
npm start
```

The server will start on `http://localhost:9090`, exposing an endpoint to generate tokens at `http://localhost:9090/generate-gcloud-identity-token`.

### Using the Token Generator in Postman

Follow these steps to configure Postman for automatically fetching and using Google Cloud Identity tokens:

#### 1. Create a New Environment in Postman

1. In Postman, go to the **Environments** section and create a new environment called `X` (any name you prefer).
2. Add a variable:
    - **Key**: `GCLOUD_IDENTITY_TOKEN`
    - **Type**: Set it to **Secret**.
    - **Initial Value**: Leave it blank (this will be automatically set by the script).

#### 2. Pre-request Script for Automatic Token Generation

For each request to your secured Cloud Run service, add the following **Pre-request Script** to automatically fetch a new token before sending the request:

1. Open the request in Postman and go to the **Pre-request Script** tab.
2. Add this script:

    ```javascript
    pm.sendRequest(
        "http://localhost:9090/generate-gcloud-identity-token",
        (err, res) => {
            if (err) {
                console.log("Error fetching token:", err)
            } else {
                const token = res.json().token

                pm.variables.set("GCLOUD_IDENTITY_TOKEN", token) // Set the token as a variable
            }
        }
    )
    ```

This script will fetch a new identity token from your local server and store it in the `GCLOUD_IDENTITY_TOKEN` variable before each request.

#### 3. Use the Token in Authorization

1. In the **Authorization** tab of your request, set the following:
    - **Type**: Bearer Token
    - **Token**: Use the variable `{{GCLOUD_IDENTITY_TOKEN}}`

Postman will now use the token fetched by the Pre-request Script as the Bearer token for authorization.

#### 4. Send the Request

When you send the request, Postman will:

1. Fetch a new Google Cloud Identity token from your local token generator.
2. Use this token to authenticate the request to your Cloud Run service.

### Security Considerations

#### Local Use Only

This application is meant strictly for **local use**. Do not expose it to the internet or external networks, as it handles sensitive credentials.

#### Service Account Security

Ensure that your service account JSON key file is stored securely. It should not be shared or exposed. Consider using Google Cloud Secret Manager for better security.

#### Postman Secrets

In Postman, set the **GCLOUD_IDENTITY_TOKEN** variable as a **Secret** to prevent exposing the token in logs or shared environments.

---

[← Back to Main Documentation](../README.md)
