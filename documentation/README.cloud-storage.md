# Cloud Storage Module Documentation

[← Back to Main Documentation](../README.md)

This module provides an abstraction for interacting with cloud storage services, currently implemented using Google Cloud Storage. It allows file operations (like uploading, retrieving, and deleting) with the flexibility to easily switch to other providers such as AWS S3 in the future.

## Key Features

-   **File and Directory Operations**:
    -   Basic file operations include uploading, retrieving, deleting, and checking if a directory is empty.
    -   The service works with cloud storage providers and abstracts these operations, allowing easy switching of providers.
-   **Provider Abstraction**:
    -   The module uses a provider system to allow the underlying cloud storage service (like Google Cloud Storage) to be swapped out easily.
    -   New providers can be implemented by adhering to the `ICloudStorage` interface.

## Configuration

### Environment Variables

The following variables must be set up for the current Google Cloud Storage provider:

```bash
GCS_BUCKET_NAME=your-bucket-name
GCS_BASE_DOWNLOAD_URL=https://storage.googleapis.com
GCP_SERVICE_ACCOUNT_KEY=your-service-account-key
```

For other providers (e.g., AWS S3), different configuration options would be required.

## Usage

### 1. **Service**

The service abstracts file and directory operations, making calls to the cloud provider of your choice. It handles operations like:

-   Uploading or updating a file.
-   Fetching a file or a list of files.
-   Deleting a file.
-   Checking if a directory is empty.

These methods are provider-agnostic and can be extended to work with any storage provider by implementing the `ICloudStorage` interface.

### 2. **Controller (for Development Only)**

The controller provides endpoints to interact with the cloud storage service during development. This should **not** be used in production, where you should interact with the service directly.

#### Example Endpoints:

-   **Upload File** (`POST /cloud-storage/file`): Upload a new file to a specified destination.
-   **Get File** (`GET /cloud-storage/file?path={path}`): Retrieve a file by its path.
-   **Delete File** (`DELETE /cloud-storage/file`): Delete a file by specifying its path.
-   **Check Directory** (`GET /cloud-storage/is-dir-empty?path={path}`): Check if a directory is empty.

### 3. **Adding New Providers**

To add a new storage provider (such as AWS S3), implement the `ICloudStorage` interface and adjust the provider configuration in the module:

```typescript
// Example for adding AWS S3
import { S3CloudStorageProvider } from "./providers/s3-cloud-storage.provider"

export const CloudStorageProviders: Provider[] = [
    {
        provide: CLOUD_STORAGE_PROVIDER,
        useClass: S3CloudStorageProvider // Swap with S3CloudStorageProvider
    }
]
```

This ensures the service remains provider-agnostic, allowing seamless integration with different storage backends.

---

## Extending and Modifying

The module is designed to remain flexible and easy to extend. When adding new operations or modifying the existing functionality, ensure that the following guidelines are followed:

1. **Service Interface**: All new methods should be added to the `ICloudStorage` interface to maintain compatibility across different providers.
2. **Provider Implementation**: Implement any new methods within the respective provider classes (e.g., `GoogleCloudStorageProvider`).
3. **Controller Updates**: If using the controller for development purposes, you may expose the new methods here for easy interaction during testing.

### Summary

The Cloud Storage module offers a flexible and provider-agnostic way to interact with cloud storage services. While the current implementation uses Google Cloud Storage, switching to or adding other providers is straightforward by implementing the `ICloudStorage` interface.

This high-level abstraction ensures the module remains easy to extend and modify as requirements evolve, without needing to rewrite core logic.

---

[← Back to Main Documentation](../README.md)
