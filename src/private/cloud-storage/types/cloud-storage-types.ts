import { Bucket } from "@google-cloud/storage"

export type GoogleCloudStorageClient = {
    bucket: Bucket
    baseUrl: string
    gcsBucketName: string
    gcsBaseDownloadUrl: string
}

export type UpsertFileSuccessMessage = string
export type DeleteFileSuccessMessage = string
