import { Injectable, Logger } from "@nestjs/common"
import { Err, Ok, Result } from "pratica"
import { CheckTrademarkDto } from "./dto/trademark.dto"
import {
    ITrademark,
    TrademarkResult,
    TrademarkStatus
} from "./interface/ITrademark"
import { TrademarkError } from "./error/trademark.error"

@Injectable()
export class TrademarkService implements ITrademark {
    private readonly logger = new Logger(TrademarkService.name)

    constructor() {}

    public check({
        name
    }: CheckTrademarkDto): Result<TrademarkResult, TrademarkError> {
        this.logger.debug(`Checking trademark for: ${name}`)

        if (!name) {
            return Err(new TrademarkError("Trademark name is required"))
        }

        // Mocked response
        const randomStatus = Math.random()
        let status: TrademarkStatus

        if (randomStatus < 0.33) {
            status = TrademarkStatus.AVAILABLE
        } else if (randomStatus < 0.66) {
            status = TrademarkStatus.REGISTERED
        } else {
            status = TrademarkStatus.PENDING
        }

        return Ok({
            name,
            status
        })
    }
}
