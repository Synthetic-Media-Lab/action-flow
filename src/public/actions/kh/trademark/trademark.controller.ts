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
import { ITrademark, TrademarkResult } from "./interface/ITrademark"
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

    @Get("checkWipo")
    @UsePipes(new ValidationPipe({ transform: true }))
    async checkWipo(
        @Query() checkTrademarkDto: CheckTrademarkDto
    ): Promise<TrademarkResult> {
        const { name } = checkTrademarkDto

        this.logger.debug(`Received WIPO trademark name: ${name}`)

        const result = this.trademarkService.checkWipo(checkTrademarkDto)

        return result.cata({
            Ok: result => result,
            Err: error => {
                this.logger.error(
                    `Error checking WIPO trademark: ${error.message}`
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

    @Get("checkEuipo")
    @UsePipes(new ValidationPipe({ transform: true }))
    async checkEuipo(
        @Query() checkTrademarkDto: CheckTrademarkDto
    ): Promise<TrademarkResult> {
        const { name } = checkTrademarkDto

        this.logger.debug(`Received EUIPO trademark name: ${name}`)

        const result = this.trademarkService.checkEuipo(checkTrademarkDto)

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
