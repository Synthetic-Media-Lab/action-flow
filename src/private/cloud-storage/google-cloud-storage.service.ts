import { Inject, Injectable } from "@nestjs/common"
import { ICloudStorage } from "./interface/ICloudStorage"
import { CLOUD_STORAGE_PROVIDER } from "./cloud-storage.providers"

@Injectable()
export class CloudStorageService implements ICloudStorage {
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
