import { Provider } from "@nestjs/common"
import { GoogleCloudStorageProvider } from "./providers/google-cloud-storage.provider"

export const CLOUD_STORAGE_PROVIDER = "CLOUD_STORAGE_PROVIDER"

export const CloudStorageProviders: Provider[] = [
    {
        provide: CLOUD_STORAGE_PROVIDER,
        useClass: GoogleCloudStorageProvider
    }
]
