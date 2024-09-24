import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { err, ok, Result } from "neverthrow"
import { CheckDomainAvailabilityDto } from "../dto/domain-availability.dto"
import {
    DomainAvailabilityResult,
    DomainStatus,
    IDomainAvailabilityStrategy
} from "../interfaces/IDomainAvailability"
import { DomainAvailabilityError } from "../error"
import { NotFoundError } from "src/error/not-found.error"
import { formatErrorForLogging } from "src/shared/pure-utils/pure-utils"
import { FetchService } from "src/private/fetch/fetch.service"
import { DynadotSearchResponse } from "../types/dynadot"
import { parseString } from "xml2js"

@Injectable()
export class DynadotDomainAvailabilityStrategy
    implements IDomainAvailabilityStrategy
{
    private readonly logger = new Logger(DynadotDomainAvailabilityStrategy.name)
    private readonly apiKey: string
    private readonly apiUrl: string

    constructor(
        private readonly configService: ConfigService,
        private readonly fetchService: FetchService
    ) {
        this.apiKey = this.configService.get<string>("DYNADOT_API_KEY") ?? ""
        this.apiUrl = this.configService.get<string>("DYNADOT_API_URL") ?? ""
    }

    public async check({
        domain
    }: CheckDomainAvailabilityDto): Promise<
        Result<DomainAvailabilityResult, DomainAvailabilityError>
    > {
        this.logger.debug(
            `Checking domain availability with Dynadot for: ${domain}`
        )

        try {
            const response = await this.fetchDomainAvailability(domain)

            if (!response) {
                return err(new NotFoundError("No data received from Dynadot"))
            }

            const parsedResult = await this.parseDynadotResponse(response)

            return ok({
                domain,
                status: parsedResult.status,
                provider: "Dynadot",
                pricing: parsedResult.pricing
            })
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(`Error with Dynadot: ${message}`)

            return err(new Error(message))
        }
    }

    private async fetchDomainAvailability(
        domain: string
    ): Promise<string | null> {
        const url = `${this.apiUrl}?key=${this.apiKey}&command=search&show_price=1&currency=EUR&domain0=${domain}`

        const result = await this.fetchService.html(url)

        if (result.isErr()) {
            this.logger.error(
                `Failed to fetch from Dynadot: ${result.error.message}`
            )
            throw new Error(
                `Failed to fetch data from Dynadot: ${result.error.message}`
            )
        }

        return result.value
    }

    private async parseDynadotResponse(response: string): Promise<{
        status: DomainStatus
        pricing?: { registrationPrice: number; renewalPrice: number }
    }> {
        const parsedXml = (await this.parseStringPromise(response, {
            explicitArray: false
        })) as DynadotSearchResponse

        const searchHeader = parsedXml?.Results?.SearchResponse?.SearchHeader

        const status =
            searchHeader?.Available === "yes"
                ? DomainStatus.AVAILABLE
                : DomainStatus.TAKEN

        let pricing
        if (searchHeader?.Price) {
            const priceMatch = searchHeader.Price.match(
                /Registration Price: ([0-9.]+) in EUR and Renewal price: ([0-9.]+) in EUR/
            )
            if (priceMatch) {
                pricing = {
                    registrationPrice: parseFloat(priceMatch[1]),
                    renewalPrice: parseFloat(priceMatch[2])
                }
            }
        }

        return { status, pricing }
    }

    private parseStringPromise = (
        xml: string,
        options: object
    ): Promise<DynadotSearchResponse> =>
        new Promise((resolve, reject) => {
            parseString(xml, options, (err, result: DynadotSearchResponse) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
}
