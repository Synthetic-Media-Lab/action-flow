import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Post,
    Query
} from "@nestjs/common"
import { GetCloudStorageFileInput } from "./dto/get-file.input"
import {
    DeleteCloudStorageFileInput,
    UpsertCloudStorageFileContentInput,
    UpsertCloudStorageFileDestinationInput
} from "./dto/upload-file.input"
import { ICloudStorage } from "./interface/ICloudStorage"
import { CLOUD_STORAGE_PROVIDER } from "./cloud-storage.providers"
import { identity } from "rxjs"

@Controller("cloud-storage")
export class CloudStorageController {
    constructor(
        @Inject(CLOUD_STORAGE_PROVIDER)
        private readonly cloudStorageService: ICloudStorage
    ) {}

    @Get("file")
    async getFile(@Query() query: GetCloudStorageFileInput) {
        const result = await this.cloudStorageService.getFile(query.path)

        return result.match(identity, error => {
            throw new HttpException(
                error.message,
                error.statusCode || HttpStatus.BAD_REQUEST
            )
        })
    }

    @Get("files")
    async getFiles(@Query() query: GetCloudStorageFileInput) {
        const result = await this.cloudStorageService.getFiles(query.path)
        return result.match(identity, error => {
            throw new HttpException(
                error.message,
                error.statusCode || HttpStatus.BAD_REQUEST
            )
        })
    }

    @Post("file")
    async upsertFile(
        @Body()
        body: UpsertCloudStorageFileContentInput &
            UpsertCloudStorageFileDestinationInput
    ) {
        const result = await this.cloudStorageService.upsertFile(
            body.fileContent,
            body.destination
        )
        return result.match(
            value => ({ message: value }),
            error => {
                throw new HttpException(
                    error.message,
                    error.statusCode || HttpStatus.BAD_REQUEST
                )
            }
        )
    }

    @Delete("file")
    async deleteFile(@Body() body: DeleteCloudStorageFileInput) {
        const result = await this.cloudStorageService.deleteFile(body.path)
        return result.match(
            value => ({ message: value }),
            error => {
                throw new HttpException(
                    error.message,
                    error.statusCode || HttpStatus.BAD_REQUEST
                )
            }
        )
    }

    @Get("is-dir-empty")
    async isDirEmpty(@Query() query: GetCloudStorageFileInput) {
        const result = await this.cloudStorageService.isDirEmpty(query.path)
        return result.match(
            value => ({ isEmpty: value }),
            error => {
                throw new HttpException(
                    error.message,
                    error.statusCode || HttpStatus.BAD_REQUEST
                )
            }
        )
    }
}
