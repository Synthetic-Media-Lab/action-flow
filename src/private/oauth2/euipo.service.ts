import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Err, Ok, Result } from "pratica"
import { CheckTrademarkDto } from "./dto/check-trademark.dto"
import { ICheckTrademark, TrademarkResult } from "./interface/oauth2.interface"
import { OAuth2Service } from "./oauth2.service"
import { FetchService } from "../fetch/fetch.service"

@Injectable()
export class EUIPOService implements ICheckTrademark {
    constructor(
        private readonly fetchService: FetchService,
        private readonly oauth2Service: OAuth2Service,
        private readonly configService: ConfigService
    ) {}

    async checkTrademark(
        options: CheckTrademarkDto
    ): Promise<Result<TrademarkResult, Error>> {
        const tokenResult = await this.oauth2Service.getAccessToken()

        return tokenResult.cata({
            Ok: async accessToken => {
                const euipoUrl = this.configService.get<string>("EUIPO_API_URL")

                const queryParams = new URLSearchParams({
                    query: options.brand,
                    page: (options.width || 1).toString(),
                    size: (options.height || 10).toString()
                })

                const fetchResult =
                    await this.fetchService.json<TrademarkResult>(
                        `${euipoUrl}?${queryParams.toString()}`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                "X-IBM-Client-Id":
                                    this.configService.get<string>(
                                        "EUIPO_CLIENT_ID"
                                    )
                            }
                        }
                    )

                return fetchResult.cata({
                    Ok: data => Ok(data),
                    Err: () =>
                        Err(new Error("Failed to fetch trademark information"))
                })
            },
            Err: () => Err(new Error("Failed to retrieve access token"))
        })
    }
}
