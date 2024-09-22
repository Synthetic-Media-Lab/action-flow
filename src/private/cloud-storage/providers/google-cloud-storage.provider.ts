import { Storage } from "@google-cloud/storage"
import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Result, err, ok } from "neverthrow"
import { InvalidInputError } from "src/error/invalid-input.error"
import { NotFoundError } from "src/error/not-found.error"
import { ValidationError } from "src/error/validation.error"
import { formatErrorForLogging } from "src/shared/pure-utils/pure-utils"
import { ZodError } from "zod"
import { CloudStorageError } from "../error"
import { ICloudStorage } from "../interface/ICloudStorage"
import { CloudDataFile, CloudMetadataFile } from "../types/cloud-fIle-types"

@Injectable()
export class GoogleCloudStorageProvider implements ICloudStorage {
    private readonly logger = new Logger(GoogleCloudStorageProvider.name)
    private storageClient: Storage
    private bucketName: string
    private projectName: string

    constructor(private configService: ConfigService) {
        const projectName = this.configService.get<string>("GCP_PROJECT_ID")
        const bucketName = this.configService.get<string>("GCS_BUCKET_NAME")
        const serviceAccountKeyString = this.configService.get<string>(
            "GCP_SERVICE_ACCOUNT_KEY"
        )

        if (!projectName || !bucketName || !serviceAccountKeyString) {
            this.logger.error("Missing required Google Cloud configuration")
            throw new Error("Missing required Google Cloud configuration")
        }

        const serviceAccountKey = JSON.parse(serviceAccountKeyString)

        this.projectName = projectName
        this.bucketName = bucketName
        this.storageClient = new Storage({
            credentials: serviceAccountKey
        })
    }

    public async getFile(
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
                id: metadata.id || "",
                name: metadata.name || "",
                contentType: metadata.contentType || "application/octet-stream",
                size: metadata.size?.toString() || "0",
                mediaLink: metadata.mediaLink || "",
                publicLink: metadata.mediaLink || "",
                path: metadata.name || "",
                data: contents.toString() || ""
            })

            if (dataFile instanceof ZodError) {
                return err(
                    new ValidationError(
                        `Invalid file metadata at path: ${path}`
                    )
                )
            }

            return ok(dataFile)
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(`Error getting file at path ${path}: ${message}`)

            return err(new InvalidInputError(message))
        }
    }

    public async getFiles(
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

            const metadataFilesResult = files.reduce<
                Result<CloudMetadataFile[], CloudStorageError>
            >((acc, file) => {
                if (acc.isErr()) return acc

                const metadataFile = CloudMetadataFile.create({
                    id: file.metadata.id || "",
                    name: file.name || "",
                    contentType:
                        file.metadata.contentType || "application/octet-stream",
                    size: file.metadata.size?.toString() || "0",
                    mediaLink: file.metadata.mediaLink || "",
                    publicLink: file.metadata.mediaLink || "",
                    path: file.name || "",
                    createdDate: file.metadata.timeCreated || ""
                })

                if (metadataFile instanceof ZodError) {
                    return err(
                        new ValidationError(
                            `Invalid metadata for file: ${file.name}`
                        )
                    )
                }

                return ok([...acc.value, metadataFile])
            }, ok([]))

            return metadataFilesResult
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(`Error getting files at path ${path}: ${message}`)

            return err(new InvalidInputError(message))
        }
    }

    public async upsertFile(
        fileContent: string,
        destination: string
    ): Promise<Result<CloudMetadataFile, CloudStorageError>> {
        try {
            const file = this.storageClient
                .bucket(this.bucketName)
                .file(destination)

            await file.save(fileContent)

            const [metadata] = await file.getMetadata()

            const objectDetailsLink = this.getObjectDetailsLink({
                filePath: destination,
                bucketName: this.bucketName,
                projectName: this.projectName
            })

            const metadataFile = CloudMetadataFile.create({
                id: metadata.id || "",
                name: metadata.name || "",
                contentType: metadata.contentType || "application/octet-stream",
                size: metadata.size?.toString() || "0",
                mediaLink: objectDetailsLink || "",
                path: metadata.name || "",
                createdDate: metadata.timeCreated || ""
            })

            if (metadataFile instanceof ZodError) {
                return err(
                    new ValidationError(
                        `Invalid file metadata at path: ${destination}`
                    )
                )
            }

            return ok(metadataFile)
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(
                `Error uploading file to ${destination}: ${message}`
            )

            return err(new InvalidInputError(message))
        }
    }

    public async deleteFile(
        path: string
    ): Promise<Result<string, CloudStorageError>> {
        try {
            const file = this.storageClient.bucket(this.bucketName).file(path)

            const [exists] = await file.exists()
            if (!exists) {
                return err(new NotFoundError(`File not found at path: ${path}`))
            }

            await file.delete()

            return ok(`File deleted at ${path}`)
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(`Error deleting file at ${path}: ${message}`)

            return err(new InvalidInputError(message))
        }
    }

    public async isDirEmpty(
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
            const { message } = formatErrorForLogging(error)

            this.logger.error(
                `Error checking if directory is empty at ${path}: ${message}`
            )

            return err(new InvalidInputError(message))
        }
    }

    private getObjectDetailsLink({
        filePath,
        bucketName,
        projectName
    }: {
        filePath: string
        bucketName: string
        projectName: string
    }): string {
        const encodedFilePath = encodeURIComponent(filePath)

        return `https://console.cloud.google.com/storage/browser/_details/${bucketName}/${encodedFilePath}?orgonly=true&project=${projectName}`
    }
}
