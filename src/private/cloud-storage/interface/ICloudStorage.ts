import { Result } from "neverthrow"
import { CloudDataFile, CloudMetadataFile } from "../types/cloud-fIle-types"
import { CloudStorageError } from "../error"

export interface IGetFile {
    getFile(path: string): Promise<Result<CloudDataFile, CloudStorageError>>
}

export interface IGetFiles {
    getFiles(
        path: string
    ): Promise<Result<CloudMetadataFile[], CloudStorageError>>
}

export interface IUpsertFile {
    upsertFile(
        fileContent: string,
        destination: string
    ): Promise<Result<CloudMetadataFile, CloudStorageError>>
}

export interface IDeleteFile {
    deleteFile(path: string): Promise<Result<string, CloudStorageError>>
}

export interface IIsDirEmpty {
    isDirEmpty(path: string): Promise<Result<boolean, CloudStorageError>>
}

export interface ICloudStorage
    extends IGetFile,
        IGetFiles,
        IUpsertFile,
        IDeleteFile,
        IIsDirEmpty {}
