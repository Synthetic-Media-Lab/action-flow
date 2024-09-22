import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Logger,
    Post,
    Query,
    UseInterceptors,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import { LoggingInterceptor } from "src/shared/interceptors/logging-interceptor"
import { CheckTrademarkDto, UploadEuipoResultDto } from "./dto/trademark.dto"
import {
    IEuipoTrademark,
    IEuipoTrademarksResult
} from "./interface/IEuipoTrademarksResult"
import { ITrademark } from "./interface/ITrademark"
import { TRADEMARK_SERVICE_TOKEN } from "./trademark.providers"
import { CloudMetadataFile } from "src/private/cloud-storage/types/cloud-fIle-types"
import { identity } from "rxjs"

@Controller("trademark")
@UseInterceptors(LoggingInterceptor)
export class TrademarkController {
    private readonly logger: Logger

    constructor(
        @Inject(TRADEMARK_SERVICE_TOKEN)
        private readonly trademarkService: ITrademark
    ) {
        this.logger = new Logger(TrademarkController.name)
    }

    @Get("euipo")
    @UsePipes(new ValidationPipe({ transform: true }))
    async checkEuipo(
        @Query() checkTrademarkDto: CheckTrademarkDto
    ): Promise<IEuipoTrademarksResult<IEuipoTrademark>> {
        const { name, niceClasses, size, page } = checkTrademarkDto

        this.logger.debug(
            `Received EUIPO trademark query: name=${name}, niceClasses=${niceClasses}, size=${size}, page=${page}`
        )

        const result = await this.trademarkService.checkEuipo(checkTrademarkDto)

        return result.match(identity, error => {
            this.logger.error(
                `Error checking EUIPO trademark: ${error.message}`
            )

            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message
                },
                HttpStatus.BAD_REQUEST
            )
        })
    }

    @Post("upload")
    async uploadEuipoResultToCloudStorage(
        @Body()
        {
            euipoTrademarksResult,
            googleSheetBrandSelection
        }: UploadEuipoResultDto<IEuipoTrademark>
    ): Promise<CloudMetadataFile> {
        const result =
            await this.trademarkService.uploadEuipoResultToCloudStorage(
                euipoTrademarksResult,
                googleSheetBrandSelection
            )

        return result.match(identity, error => {
            this.logger.error(
                `Error uploading EUIPO trademark result: ${error.message}`
            )

            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message
                },
                HttpStatus.BAD_REQUEST
            )
        })
    }
}
