import { IsString } from "class-validator"

export class GetCloudStorageFileInput {
    @IsString()
    path: string = ""
}

export class GetCloudStorageFilesInput {
    @IsString()
    path: string = ""
}
