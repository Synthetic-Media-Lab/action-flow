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
    EuipoTrademarkResult,
    EuipoTrademarkSearchStrategy
} from "./interface/ITrademark"
import { RetryService } from "src/private/retry/retry.service"

@Injectable()
export class TrademarkService implements ITrademark {
    private readonly logger = new Logger(TrademarkService.name)

    constructor(
        private readonly configService: ConfigService,
        private readonly oauth2Service: OAuth2Service,
        private readonly fetchService: FetchService,
        private readonly retryService: RetryService
    ) {}

    public async checkEuipo({
        name,
        niceClasses = [],
        searchStrategy = EuipoTrademarkSearchStrategy.EXACT,
        statusesToExclude = [],
        size = 10,
        page = 0
    }: CheckTrademarkDto): Promise<
        Result<EuipoTrademarkResult, TrademarkError>
    > {
        this.logger.debug(
            `Checking EUIPO trademark. Configuration: ${JSON.stringify({ name, niceClasses, searchStrategy, statusesToExclude, size, page })}`
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

        return tokenResult.cata({
            Ok: async accessToken => {
                this.logger.debug(
                    `Received access token: ${JSON.stringify(accessToken)}`
                )

                const euipoUrl = this.configService.get<string>("EUIPO_API_URL")

                const brandSearchQuery =
                    searchStrategy === EuipoTrademarkSearchStrategy.EXACT
                        ? `wordMarkSpecification.verbalElement=="${name}"`
                        : `wordMarkSpecification.verbalElement=="*${name}*"`

                const query = this.buildEuipoQuery(
                    brandSearchQuery,
                    niceClasses,
                    defaultStatusesToExclude.length
                        ? defaultStatusesToExclude
                        : []
                )((name, niceClasses, statusesToExclude) => {
                    const statusStrings = statusesToExclude.length
                        ? `and status=out=(${statusesToExclude.join(",")})`
                        : ""

                    return `${name} and niceClasses=all=(${niceClasses.join(",")}) ${statusStrings}`
                })

                const fetchResult = await this.retryService.retry(
                    () =>
                        this.fetchService.json<EuipoTrademarkResult>(
                            `${euipoUrl}?query=${encodeURIComponent(query)}&size=${size}&page=${page}`,
                            {
                                method: "GET",
                                headers: {
                                    Authorization: `Bearer ${accessToken.access_token}`,
                                    "Content-Type": "application/json",
                                    "X-IBM-Client-Id":
                                        this.configService.get<string>(
                                            "OAUTH_CLIENT_ID"
                                        )
                                }
                            }
                        ),
                    {
                        retries: 5,
                        delay: 1000,
                        exponentialBackoff: true,
                        timeout: 10000
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
