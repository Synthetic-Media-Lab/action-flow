import { Result } from "pratica"
import { TrademarkError } from "../error/trademark.error"
import { CheckTrademarkDto } from "../dto/trademark.dto"

export interface ITrademark extends ICheckTrademark {}

interface ICheckTrademark {
    check(data: CheckTrademarkDto): Result<TrademarkResult, TrademarkError>
}

export enum TrademarkStatus {
    AVAILABLE = "available",
    REGISTERED = "registered",
    PENDING = "pending",
    UNKNOWN = "unknown"
}

export interface TrademarkResult {
    name: string
    status: TrademarkStatus
    details?: {
        registrationNumber?: string
        applicationDate?: string
    }
}
