process.env.GCP_SERVICE_ACCOUNT_KEY = JSON.stringify({
    type: "service_account",
    project_id: "mock-project-id",
    private_key_id: "mock-private-key-id",
    private_key:
        "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7T7A/FGuar9Or...\n-----END PRIVATE KEY-----\n",
    client_email: "mock-email@mock-project.iam.gserviceaccount.com",
    client_id: "mock-client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
        "https://www.googleapis.com/robot/v1/metadata/x509/mock-email@mock-project.iam.gserviceaccount.com"
})
