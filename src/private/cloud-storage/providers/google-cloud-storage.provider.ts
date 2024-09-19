import { Injectable, Logger } from "@nestjs/common"
import { Result, ok, err } from "neverthrow"
import { CloudDataFile, CloudMetadataFile } from "../types/cloud-fIle-types"
import { CloudStorageError } from "../types/cloud-storage-error"
import { ConfigService } from "@nestjs/config"
import { Storage } from "@google-cloud/storage"
import { InvalidInputError } from "src/error/invalid-input.error"
import { NotFoundError } from "src/error/not-found.error"
import { ICloudStorage } from "../interface/ICloudStorage"

@Injectable()
export class GoogleCloudStorageProvider implements ICloudStorage {
    private readonly logger = new Logger(GoogleCloudStorageProvider.name)
    private storageClient: Storage
    private bucketName: string

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.get<string>("GCS_BUCKET_NAME")
        const serviceAccountKey = JSON.parse(
            this.configService.get<string>("GCP_SERVICE_ACCOUNT_KEY")
        )

        this.storageClient = new Storage({
            credentials: serviceAccountKey
        })
    }

    async getFile(
        path: string
    ): Promise<Result<CloudDataFile, CloudStorageError>> {
        try {
            const file = this.storageClient.bucket(this.bucketName).file(path)

            const [exists] = await file.exists()
            if (!exists) {
                return err(new NotFoundError(`File not found at path: ${path}`))
            }

            const [metadata] = await file.getMetadata()
            const [contents] = await file.download()

            const dataFile = CloudDataFile.create({
                id: metadata.id,
                name: metadata.name,
                contentType: metadata.contentType,
                size: metadata.size.toString(),
                mediaLink: metadata.mediaLink,
                publicLink: metadata.mediaLink,
                path: metadata.name,
                data: contents.toString()
            })

            return ok(dataFile)
        } catch (error) {
            this.logger.error(
                `Error getting file at path ${path}: ${error.message}`
            )
            return err(new InvalidInputError(error.message))
        }
    }

    async getFiles(
        path: string
    ): Promise<Result<CloudMetadataFile[], CloudStorageError>> {
        try {
            const [files] = await this.storageClient
                .bucket(this.bucketName)
                .getFiles({
                    prefix: path
                })

            if (files.length === 0) {
                return err(new NotFoundError(`No files found at path: ${path}`))
            }

            const metadataFiles = files.map(file =>
                CloudMetadataFile.create({
                    id: file.metadata.id,
                    name: file.name,
                    contentType: file.metadata.contentType,
                    size: file.metadata.size.toString(),
                    mediaLink: file.metadata.mediaLink,
                    publicLink: file.metadata.mediaLink,
                    path: file.name,
                    createdDate: file.metadata.timeCreated
                })
            )

            return ok(metadataFiles)
        } catch (error) {
            this.logger.error(
                `Error getting files at path ${path}: ${error.message}`
            )
            return err(new InvalidInputError(error.message))
        }
    }

    async upsertFile(
        fileContent: string,
        destination: string
    ): Promise<Result<string, CloudStorageError>> {
        try {
            const file = this.storageClient
                .bucket(this.bucketName)
                .file(destination)

            await file.save(fileContent)

            return ok(`File uploaded to ${destination}`)
        } catch (error) {
            this.logger.error(
                `Error uploading file to ${destination}: ${error.message}`
            )
            return err(new InvalidInputError(error.message))
        }
    }

    async deleteFile(path: string): Promise<Result<string, CloudStorageError>> {
        try {
            const file = this.storageClient.bucket(this.bucketName).file(path)

            const [exists] = await file.exists()
            if (!exists) {
                return err(new NotFoundError(`File not found at path: ${path}`))
            }

            await file.delete()

            return ok(`File deleted at ${path}`)
        } catch (error) {
            this.logger.error(
                `Error deleting file at ${path}: ${error.message}`
            )
            return err(new InvalidInputError(error.message))
        }
    }

    async isDirEmpty(
        path: string
    ): Promise<Result<boolean, CloudStorageError>> {
        try {
            const [files] = await this.storageClient
                .bucket(this.bucketName)
                .getFiles({
                    prefix: path,
                    maxResults: 1
                })

            return ok(files.length === 0)
        } catch (error) {
            this.logger.error(
                `Error checking if directory is empty at ${path}: ${error.message}`
            )
            return err(new InvalidInputError(error.message))
        }
    }
}
