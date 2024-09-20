import { Inject, Injectable, Logger } from "@nestjs/common"
import { ICloudStorage } from "./interface/ICloudStorage"
import { CLOUD_STORAGE_PROVIDER } from "./cloud-storage.providers"
import { OnEvent } from "@nestjs/event-emitter"
import { FileUploadEvent } from "./events/cloud-storage-events"

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

    @OnEvent("file.upload")
    handleFileUploadEvent(event: FileUploadEvent) {
        this.logger.log(`Handling file upload event for: ${event.destination}`)

        this.upsertFile(event.fileContent, event.destination).then(result => {
            result.match(
                value =>
                    this.logger.log(`File uploaded successfully to: ${value}`),
                error =>
                    this.logger.error(`Failed to upload file: ${error.message}`)
            )
        })
    }
}
