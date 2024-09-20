import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { err, ok, Result } from "neverthrow"
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
import { FetchError } from "src/error/fetch.error"

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
            return err(new TrademarkError("EUIPO Trademark name is required"))
        }

        const validNiceClasses =
            niceClasses && niceClasses.length > 0 ? niceClasses : []

        const defaultStatusesToExclude = statusesToExclude.length
            ? statusesToExclude
            : [EuipoTrademarkStatus.EXPIRED]

        const tokenResult = await this.oauth2Service.getAccessToken()

        return tokenResult.match(
            async accessToken => {
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
                    validNiceClasses,
                    defaultStatusesToExclude
                )((name, niceClasses, statusesToExclude) => {
                    const statusStrings = statusesToExclude.length
                        ? `and status=out=(${statusesToExclude.join(",")})`
                        : ""

                    const niceClassesString = niceClasses.length
                        ? `and niceClasses=all=(${niceClasses.join(",")})`
                        : ""

                    return `${name} ${niceClassesString} ${statusStrings}`
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
                        retryOnResult: result =>
                            result.match(
                                () => false,
                                error => {
                                    if (error instanceof FetchError) {
                                        const statusCode = error.statusCode
                                        return (
                                            statusCode === 401 ||
                                            (statusCode >= 500 &&
                                                statusCode < 600)
                                        )
                                    }
                                    return false
                                }
                            )
                    }
                )

                return fetchResult.match(
                    data => ok(data),
                    () =>
                        err(
                            new TrademarkError(
                                "Failed to fetch trademark information"
                            )
                        )
                )
            },
            () => err(new TrademarkError("Failed to retrieve access token"))
        )
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
