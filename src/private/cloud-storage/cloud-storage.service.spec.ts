import { Test, TestingModule } from "@nestjs/testing"
import { err, ok } from "neverthrow"
import { InvalidInputError } from "../../error/invalid-input.error"
import { NotFoundError } from "../../error/not-found.error"
import { CLOUD_STORAGE_PROVIDER } from "./cloud-storage.providers"
import { CloudStorageService } from "./google-cloud-storage.service"
import { ICloudStorage } from "./interface/ICloudStorage"
import { mockFileMetadata } from "./mock/google-storage"
import { CloudDataFile, CloudMetadataFile } from "./types/cloud-fIle-types"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ZodError } from "zod"

describe("CloudStorageService", () => {
    let service: CloudStorageService
    let mockProvider: jest.Mocked<ICloudStorage>

    beforeEach(async () => {
        mockProvider = {
            getFile: jest.fn(),
            getFiles: jest.fn(),
            upsertFile: jest.fn(),
            deleteFile: jest.fn(),
            isDirEmpty: jest.fn()
        }

        const module: TestingModule = await Test.createTestingModule({
            imports: [EventEmitterModule.forRoot()],
            providers: [
                CloudStorageService,
                {
                    provide: CLOUD_STORAGE_PROVIDER,
                    useValue: mockProvider
                }
            ]
        }).compile()

        service = module.get<CloudStorageService>(CloudStorageService)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should be defined", () => {
        expect(service).toBeDefined()
    })

    describe("getFile", () => {
        it("should return file data when file exists", async () => {
            const path = "existing-file.txt"
            const mockFile = CloudDataFile.create({
                ...mockFileMetadata,
                name: path,
                path,
                data: "file content"
            })

            if (mockFile instanceof ZodError) {
                throw new Error("Mock file creation failed during test setup")
            }

            mockProvider.getFile.mockResolvedValue(ok(mockFile))

            const result = await service.getFile(path)

            expect(mockProvider.getFile).toHaveBeenCalledWith(path)

            result.match(
                value => expect(value).toEqual(mockFile),
                error =>
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
            )
        })

        it("should return NotFoundError when file does not exist", async () => {
            const path = "non-existent-file.txt"
            const error = new NotFoundError(`File not found at path: ${path}`)

            mockProvider.getFile.mockResolvedValue(err(error))

            const result = await service.getFile(path)

            expect(mockProvider.getFile).toHaveBeenCalledWith(path)

            result.match(
                () => fail("Expected Err, but got Ok"),
                err => expect(err).toEqual(error)
            )
        })
    })

    describe("getFiles", () => {
        it("should return a list of files when files exist", async () => {
            const path = "some-directory/"

            const mockFile1 = CloudMetadataFile.create({
                ...mockFileMetadata,
                name: "file1.txt",
                path: `${path}file1.txt`
            })

            const mockFile2 = CloudMetadataFile.create({
                ...mockFileMetadata,
                name: "file2.txt",
                path: `${path}file2.txt`
            })

            const mockFiles = [mockFile1, mockFile2].filter(
                (file): file is CloudMetadataFile => !(file instanceof ZodError)
            )

            mockProvider.getFiles.mockResolvedValue(ok(mockFiles))

            const result = await service.getFiles(path)

            expect(mockProvider.getFiles).toHaveBeenCalledWith(path)

            result.match(
                files => expect(files).toEqual(mockFiles),
                error =>
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
            )
        })

        it("should return NotFoundError when no files are found", async () => {
            const path = "empty-directory/"
            const error = new NotFoundError(`No files found at path: ${path}`)

            mockProvider.getFiles.mockResolvedValue(err(error))

            const result = await service.getFiles(path)

            expect(mockProvider.getFiles).toHaveBeenCalledWith(path)

            result.match(
                () => fail("Expected Err, but got Ok"),
                err => expect(err).toEqual(error)
            )
        })
    })

    describe("upsertFile", () => {
        it("should return success message when file is uploaded", async () => {
            const fileContent = "file content"
            const destination = "path/to/destination.txt"

            const cloudMetadataFile = CloudMetadataFile.create({
                id: "1234",
                name: "destination.txt",
                contentType: "text/plain",
                size: "123",
                mediaLink: "https://media-link",
                publicLink: "https://public-link",
                path: destination,
                createdDate: "2021-09-01T00:00:00.000Z"
            })

            if (cloudMetadataFile instanceof ZodError) {
                throw new Error(
                    "Mock CloudMetadataFile creation failed during test setup"
                )
            }

            mockProvider.upsertFile.mockResolvedValue(ok(cloudMetadataFile))

            const result = await service.upsertFile(fileContent, destination)

            expect(mockProvider.upsertFile).toHaveBeenCalledWith(
                fileContent,
                destination
            )

            result.match(
                file => expect(file).toEqual(cloudMetadataFile),
                error =>
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
            )
        })

        it("should return InvalidInputError when upload fails", async () => {
            const fileContent = "file content"
            const destination = "path/to/destination.txt"
            const error = new InvalidInputError("Upload failed")

            mockProvider.upsertFile.mockResolvedValue(err(error))

            const result = await service.upsertFile(fileContent, destination)

            expect(mockProvider.upsertFile).toHaveBeenCalledWith(
                fileContent,
                destination
            )

            result.match(
                () => fail("Expected Err, but got Ok"),
                err => expect(err).toEqual(error)
            )
        })
    })

    describe("deleteFile", () => {
        it("should return success message when file is deleted", async () => {
            const path = "path/to/file.txt"
            const successMessage = `File deleted at ${path}`

            mockProvider.deleteFile.mockResolvedValue(ok(successMessage))

            const result = await service.deleteFile(path)

            expect(mockProvider.deleteFile).toHaveBeenCalledWith(path)

            result.match(
                message => expect(message).toEqual(successMessage),
                error =>
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
            )
        })

        it("should return NotFoundError when file does not exist", async () => {
            const path = "path/to/non-existent-file.txt"
            const error = new NotFoundError(`File not found at path: ${path}`)

            mockProvider.deleteFile.mockResolvedValue(err(error))

            const result = await service.deleteFile(path)

            expect(mockProvider.deleteFile).toHaveBeenCalledWith(path)

            result.match(
                () => fail("Expected Err, but got Ok"),
                err => expect(err).toEqual(error)
            )
        })
    })

    describe("isDirEmpty", () => {
        it("should return true when directory is empty", async () => {
            const path = "empty-directory/"

            mockProvider.isDirEmpty.mockResolvedValue(ok(true))

            const result = await service.isDirEmpty(path)

            expect(mockProvider.isDirEmpty).toHaveBeenCalledWith(path)

            result.match(
                isEmpty => expect(isEmpty).toBe(true),
                error =>
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
            )
        })

        it("should return false when directory is not empty", async () => {
            const path = "non-empty-directory/"

            mockProvider.isDirEmpty.mockResolvedValue(ok(false))

            const result = await service.isDirEmpty(path)

            expect(mockProvider.isDirEmpty).toHaveBeenCalledWith(path)

            result.match(
                isEmpty => expect(isEmpty).toBe(false),
                error =>
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
            )
        })

        it("should return InvalidInputError when check fails", async () => {
            const path = "some-directory/"
            const error = new InvalidInputError("Error checking directory")

            mockProvider.isDirEmpty.mockResolvedValue(err(error))

            const result = await service.isDirEmpty(path)

            expect(mockProvider.isDirEmpty).toHaveBeenCalledWith(path)

            result.match(
                () => fail("Expected Err, but got Ok"),
                err => expect(err).toEqual(error)
            )
        })
    })
})
