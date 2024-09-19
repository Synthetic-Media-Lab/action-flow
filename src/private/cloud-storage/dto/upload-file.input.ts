import { IsString } from "class-validator"

export class MetaData {
    @IsString()
    key: string

    @IsString()
    value: string
}

export class UpsertCloudStorageFileContentInput {
    @IsString()
    fileContent: string
}

export class UpsertCloudStorageFileDestinationInput {
    @IsString()
    destination: string
}

export class DeleteCloudStorageFileInput {
    @IsString()
    path: string
}

export class PurgeCloudStorageDirInput {
    @IsString()
    path: string
}

export class DeleteFilesBeforeInput {
    @IsString()
    path: string

    @IsString()
    beforeDate: string
}
