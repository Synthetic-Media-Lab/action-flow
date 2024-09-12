import { Controller, Get, Query } from "@nestjs/common"
import { EUIPOService } from "./euipo.service"
import { CheckTrademarkDto } from "./dto/check-trademark.dto"
import { Result } from "pratica"

@Controller("euipo")
export class EUIPOController {
    constructor(private readonly euipoService: EUIPOService) {}

    @Get("trademarks")
    async checkTrademark(@Query() query: CheckTrademarkDto) {
        const result: Result<unknown, Error> =
            await this.euipoService.checkTrademark(query)

        return result.cata({
            Ok: data => data,
            Err: error => {
                throw new Error(error.message) // Handle errors based on your preferred strategy
            }
        })
    }
}
