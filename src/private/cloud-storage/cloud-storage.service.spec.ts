import { Test, TestingModule } from "@nestjs/testing"
import { Err, Ok } from "pratica"
import { InvalidInputError } from "../../error/invalid-input.error"
import { NotFoundError } from "../../error/not-found.error"
import { CLOUD_STORAGE_PROVIDER } from "./cloud-storage.providers"
import { CloudStorageService } from "./google-cloud-storage.service"
import { ICloudStorage } from "./interface/ICloudStorage"
import { mockFileMetadata } from "./mock/google-storage"
import { CloudDataFile, CloudMetadataFile } from "./types/CloudFileTypes"

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

            mockProvider.getFile.mockResolvedValue(Ok(mockFile))

            const result = await service.getFile(path)

            expect(mockProvider.getFile).toHaveBeenCalledWith(path)

            result.cata({
                Ok: value => {
                    expect(value).toEqual(mockFile)
                },
                Err: error => {
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
                }
            })
        })

        it("should return NotFoundError when file does not exist", async () => {
            const path = "non-existent-file.txt"
            const error = new NotFoundError(`File not found at path: ${path}`)

            mockProvider.getFile.mockResolvedValue(Err(error))

            const result = await service.getFile(path)

            expect(mockProvider.getFile).toHaveBeenCalledWith(path)

            result.cata({
                Ok: () => {
                    fail("Expected Err, but got Ok")
                },
                Err: err => {
                    expect(err).toEqual(error)
                }
            })
        })
    })

    describe("getFiles", () => {
        it("should return a list of files when files exist", async () => {
            const path = "some-directory/"
            const mockFiles = [
                CloudMetadataFile.create({
                    ...mockFileMetadata,
                    name: "file1.txt",
                    path: `${path}file1.txt`
                }),
                CloudMetadataFile.create({
                    ...mockFileMetadata,
                    name: "file2.txt",
                    path: `${path}file2.txt`
                })
            ]

            mockProvider.getFiles.mockResolvedValue(Ok(mockFiles))

            const result = await service.getFiles(path)

            expect(mockProvider.getFiles).toHaveBeenCalledWith(path)

            result.cata({
                Ok: files => {
                    expect(files).toEqual(mockFiles)
                },
                Err: error => {
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
                }
            })
        })

        it("should return NotFoundError when no files are found", async () => {
            const path = "empty-directory/"
            const error = new NotFoundError(`No files found at path: ${path}`)

            mockProvider.getFiles.mockResolvedValue(Err(error))

            const result = await service.getFiles(path)

            expect(mockProvider.getFiles).toHaveBeenCalledWith(path)

            result.cata({
                Ok: () => {
                    fail("Expected Err, but got Ok")
                },
                Err: err => {
                    expect(err).toEqual(error)
                }
            })
        })
    })

    describe("upsertFile", () => {
        it("should return success message when file is uploaded", async () => {
            const fileContent = "file content"
            const destination = "path/to/destination.txt"
            const successMessage = `File uploaded to ${destination}`

            mockProvider.upsertFile.mockResolvedValue(Ok(successMessage))

            const result = await service.upsertFile(fileContent, destination)

            expect(mockProvider.upsertFile).toHaveBeenCalledWith(
                fileContent,
                destination
            )

            result.cata({
                Ok: message => {
                    expect(message).toEqual(successMessage)
                },
                Err: error => {
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
                }
            })
        })

        it("should return InvalidInputError when upload fails", async () => {
            const fileContent = "file content"
            const destination = "path/to/destination.txt"
            const error = new InvalidInputError("Upload failed")

            mockProvider.upsertFile.mockResolvedValue(Err(error))

            const result = await service.upsertFile(fileContent, destination)

            expect(mockProvider.upsertFile).toHaveBeenCalledWith(
                fileContent,
                destination
            )

            result.cata({
                Ok: () => {
                    fail("Expected Err, but got Ok")
                },
                Err: err => {
                    expect(err).toEqual(error)
                }
            })
        })
    })

    describe("deleteFile", () => {
        it("should return success message when file is deleted", async () => {
            const path = "path/to/file.txt"
            const successMessage = `File deleted at ${path}`

            mockProvider.deleteFile.mockResolvedValue(Ok(successMessage))

            const result = await service.deleteFile(path)

            expect(mockProvider.deleteFile).toHaveBeenCalledWith(path)

            result.cata({
                Ok: message => {
                    expect(message).toEqual(successMessage)
                },
                Err: error => {
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
                }
            })
        })

        it("should return NotFoundError when file does not exist", async () => {
            const path = "path/to/non-existent-file.txt"
            const error = new NotFoundError(`File not found at path: ${path}`)

            mockProvider.deleteFile.mockResolvedValue(Err(error))

            const result = await service.deleteFile(path)

            expect(mockProvider.deleteFile).toHaveBeenCalledWith(path)

            result.cata({
                Ok: () => {
                    fail("Expected Err, but got Ok")
                },
                Err: err => {
                    expect(err).toEqual(error)
                }
            })
        })
    })

    describe("isDirEmpty", () => {
        it("should return true when directory is empty", async () => {
            const path = "empty-directory/"

            mockProvider.isDirEmpty.mockResolvedValue(Ok(true))

            const result = await service.isDirEmpty(path)

            expect(mockProvider.isDirEmpty).toHaveBeenCalledWith(path)

            result.cata({
                Ok: isEmpty => {
                    expect(isEmpty).toBe(true)
                },
                Err: error => {
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
                }
            })
        })

        it("should return false when directory is not empty", async () => {
            const path = "non-empty-directory/"

            mockProvider.isDirEmpty.mockResolvedValue(Ok(false))

            const result = await service.isDirEmpty(path)

            expect(mockProvider.isDirEmpty).toHaveBeenCalledWith(path)

            result.cata({
                Ok: isEmpty => {
                    expect(isEmpty).toBe(false)
                },
                Err: error => {
                    fail(
                        `Expected Ok, but got Err with error: ${error.message}`
                    )
                }
            })
        })

        it("should return InvalidInputError when check fails", async () => {
            const path = "some-directory/"
            const error = new InvalidInputError("Error checking directory")

            mockProvider.isDirEmpty.mockResolvedValue(Err(error))

            const result = await service.isDirEmpty(path)

            expect(mockProvider.isDirEmpty).toHaveBeenCalledWith(path)

            result.cata({
                Ok: () => {
                    fail("Expected Err, but got Ok")
                },
                Err: err => {
                    expect(err).toEqual(error)
                }
            })
        })
    })
})
