import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { Err, Ok, Result } from "pratica"
import { FetchService } from "src/private/fetch/fetch.service"
import { OAuth2Service } from "src/private/oauth2/oauth2.service"
import { CheckTrademarkDto } from "./dto/trademark.dto"
import { TrademarkError } from "./error/trademark.error"
import {
    ITrademark,
    EuipoTrademarkStatus,
    EuipoTrademarkResult
} from "./interface/ITrademark"

@Injectable()
export class TrademarkService implements ITrademark {
    private readonly logger = new Logger(TrademarkService.name)

    constructor(
        private readonly oauth2Service: OAuth2Service,
        private readonly fetchService: FetchService,
        private readonly configService: ConfigService
    ) {}

    public async checkEuipo({
        name,
        niceClasses = [],
        statusesToExclude = []
    }: CheckTrademarkDto): Promise<
        Result<EuipoTrademarkResult, TrademarkError>
    > {
        this.logger.debug(
            `Checking EUIPO trademark. Configuration: ${JSON.stringify({ name, niceClasses, statusesToExclude })}`
        )

        if (!name) {
            return Err(new TrademarkError("EUIPO Trademark name is required"))
        }

        const defaultStatusesToExclude = statusesToExclude.length
            ? statusesToExclude
            : [
                  EuipoTrademarkStatus.REGISTERED,
                  EuipoTrademarkStatus.UNDER_EXAMINATION,
                  EuipoTrademarkStatus.APPLICATION_PUBLISHED,
                  EuipoTrademarkStatus.REGISTRATION_PENDING,
                  EuipoTrademarkStatus.OPPOSITION_PENDING,
                  EuipoTrademarkStatus.APPEALED,
                  EuipoTrademarkStatus.START_OF_OPPOSITION_PERIOD
              ]

        const tokenResult = await this.oauth2Service.getAccessToken()

        this.logger.debug(
            `Received access token: ${JSON.stringify(tokenResult)}`
        )

        return tokenResult.cata({
            Ok: async accessToken => {
                const euipoUrl = this.configService.get<string>("EUIPO_API_URL")

                const query = this.buildEuipoQuery(
                    name,
                    niceClasses,
                    defaultStatusesToExclude
                )((name, niceClasses, statusesToExclude) => {
                    const statusStrings = statusesToExclude.map(status =>
                        status.toString()
                    )
                    return `wordMarkSpecification.verbalElement==*${name}* and niceClasses=all=(${niceClasses.join(
                        ","
                    )}) and status=out=(${statusStrings.join(",")})`
                })

                const fetchResult =
                    await this.fetchService.json<EuipoTrademarkResult>(
                        `${euipoUrl}?${query}`,
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
                        Err(
                            new TrademarkError(
                                "Failed to fetch trademark information"
                            )
                        )
                })
            },
            Err: () =>
                Err(new TrademarkError("Failed to retrieve access token"))
        })
    }

    private buildEuipoQuery =
        (
            name: string,
            niceClasses: number[],
            statusesToExclude: EuipoTrademarkStatus[]
        ) =>
        (
            queryBuilderFn: (
                name: string,
                niceClasses: number[],
                statusesToExclude: EuipoTrademarkStatus[]
            ) => string
        ): string =>
            queryBuilderFn(name, niceClasses, statusesToExclude)
}
