import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Logger,
    Query,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import { CheckTrademarkDto } from "./dto/trademark.dto"
import { EuipoTrademarkResult, ITrademark } from "./interface/ITrademark"
import { TRADEMARK_SERVICE_TOKEN } from "./trademark.providers"

@Controller("trademark")
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
    ): Promise<EuipoTrademarkResult> {
        const { name } = checkTrademarkDto

        this.logger.debug(`Received EUIPO trademark name: ${name}`)

        const result = await this.trademarkService.checkEuipo(checkTrademarkDto)

        return result.cata({
            Ok: result => result,
            Err: error => {
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
            }
        })
    }
}
