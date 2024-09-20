import { Inject, Injectable, Logger } from "@nestjs/common"
import { ICloudStorage } from "./interface/ICloudStorage"
import { CLOUD_STORAGE_PROVIDER } from "./cloud-storage.providers"
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter"
import { FileUploadEvent } from "./events/cloud-storage-events"
import { GoogleSheetUpdateEvent } from "../google-sheet/events/google-sheet-events"

@Injectable()
export class CloudStorageService implements ICloudStorage {
    private readonly logger = new Logger(CloudStorageService.name)

    constructor(
        @Inject(CLOUD_STORAGE_PROVIDER)
        private readonly storageProvider: ICloudStorage,
        private readonly eventEmitter: EventEmitter2
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
    async handleFileUploadEvent(event: FileUploadEvent) {
        this.logger.log(`Handling file upload event for: ${event.destination}`)

        const uploadResult = await this.upsertFile(
            event.fileContent,
            event.destination
        )

        uploadResult.match(
            value => {
                this.logger.log(`File uploaded successfully to: ${value}`)

                this.eventEmitter.emit(
                    "file.upload.completed",
                    new GoogleSheetUpdateEvent(
                        "your-sheet-id", // Your actual Google Sheet ID
                        "Sheet1", // Your sheet name (ensure it's correct)
                        3, // Row 3 (corresponding to "Heya" row)
                        "F", // Column F ("Result 2")
                        "File upload completed" // The value to set in "Result 2"
                    )
                )
            },
            error =>
                this.logger.error(`Failed to upload file: ${error.message}`)
        )
    }
}
