import { Inject, Injectable, Logger } from "@nestjs/common"
import { CLOUD_STORAGE_PROVIDER } from "./cloud-storage.providers"
import { ICloudStorage } from "./interface/ICloudStorage"

@Injectable()
export class CloudStorageService implements ICloudStorage {
    private readonly logger = new Logger(CloudStorageService.name)

    constructor(
        @Inject(CLOUD_STORAGE_PROVIDER)
        private readonly storageProvider: ICloudStorage
    ) {}

    async getFile(path: string) {
        return this.storageProvider.getFile(path)
    }

    async getFiles(path: string) {
        return this.storageProvider.getFiles(path)
    }

    async upsertFile(fileContent: string, destination: string) {
        return this.storageProvider.upsertFile(fileContent, destination)
    }

    async deleteFile(path: string) {
        return this.storageProvider.deleteFile(path)
    }

    async isDirEmpty(path: string) {
        return this.storageProvider.isDirEmpty(path)
    }
}
