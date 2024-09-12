import { Result } from "pratica"
import { CheckTrademarkDto } from "../dto/check-trademark.dto"

export interface IOAuth2Service {
    getAccessToken(): Promise<Result<string, Error>>
}

export interface ICheckTrademark {
    checkTrademark(
        options: CheckTrademarkDto
    ): Promise<Result<TrademarkResult, Error>>
}

export interface TrademarkResult {
    results: Array<TrademarkEntry>
    page: number
    total: number
}

export interface TrademarkEntry {
    id: string
    name: string
    status: string
    owner: string
    classes: string[]
}

export interface IMainOAuth2Service extends IOAuth2Service, ICheckTrademark {}
