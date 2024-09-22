import { Result } from "neverthrow"
import { CloudDataFile, CloudMetadataFile } from "../types/cloud-fIle-types"
import { CloudStorageError } from "../error"

export interface ICloudStorage {
    getFile(path: string): Promise<Result<CloudDataFile, CloudStorageError>>
    getFiles(
        path: string
    ): Promise<Result<CloudMetadataFile[], CloudStorageError>>
    upsertFile(
        fileContent: string,
        destination: string
    ): Promise<Result<CloudMetadataFile, CloudStorageError>>
    deleteFile(path: string): Promise<Result<string, CloudStorageError>>
    isDirEmpty(path: string): Promise<Result<boolean, CloudStorageError>>
}
