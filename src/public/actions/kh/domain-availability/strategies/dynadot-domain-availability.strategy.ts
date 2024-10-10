import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { err, ok, Result } from "neverthrow"
import { CheckDomainAvailabilityDto } from "../dto/domain-availability.dto"
import { DomainAvailabilityError } from "../error"
import { NotFoundError } from "src/error/not-found.error"
import { formatErrorForLogging } from "src/shared/pure-utils/pure-utils"
import { FetchService } from "src/private/fetch/fetch.service"
import { DynadotSearchResponse } from "../types/dynadot"
import { parseString } from "xml2js"
import {
    DomainAvailabilityResult,
    DomainStatus,
    IDomainAvailabilityStrategy
} from "../interfaces/IDomainAvailability"

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
        domainName
    }: CheckDomainAvailabilityDto): Promise<
        Result<DomainAvailabilityResult, DomainAvailabilityError>
    > {
        this.logger.debug(
            `Checking domain availability with Dynadot for: ${domainName}`
        )

        try {
            // Fetch the domain availability from Dynadot
            const response = await this.fetchDomainAvailability(domainName)

            if (!response) {
                // Handle cases where no response is received
                return err(new NotFoundError("No data received from Dynadot"))
            }

            // Parse the response to extract necessary information
            const parsedResult = await this.parseDynadotResponse(response)

            return ok({
                domain: domainName,
                status: parsedResult.status,
                provider: "Dynadot",
                pricing: parsedResult.pricing
            })
        } catch (error) {
            // Handle the error and log it
            const { message } = formatErrorForLogging(error)
            this.logger.error(`Error with Dynadot: ${message}`)

            return err(new Error(message))
        }
    }

    private async fetchDomainAvailability(
        domain: string
    ): Promise<string | null> {
        const url = `${this.apiUrl}?key=${this.apiKey}&command=search&show_price=1&currency=EUR&domain0=${domain}`

        this.logger.debug(`Fetching domain availability from URL: ${url}`)

        // Fetch HTML response using the FetchService
        const result = await this.fetchService.html(url)

        if (result.isErr()) {
            // Handle fetch failure
            const { message } = formatErrorForLogging(result.error)
            this.logger.error(`Failed to fetch from Dynadot: ${message}`)
            return null
        }

        this.logger.debug(`Raw Dynadot response: ${result.value}`)
        return result.value
    }

    private async parseDynadotResponse(response: string): Promise<{
        status: DomainStatus
        pricing?: { registrationPrice: number; renewalPrice: number }
    }> {
        // Parse the XML response
        const parsedXml = (await this.parseStringPromise(response, {
            explicitArray: false
        })) as DynadotSearchResponse | null

        if (!parsedXml) {
            this.logger.error("Failed to parse Dynadot response, null received")
            return {
                status: DomainStatus.UNKNOWN
            }
        }

        const searchHeader = parsedXml?.Results?.SearchResponse?.SearchHeader

        if (!searchHeader || searchHeader.SuccessCode !== "0") {
            this.logger.error(
                `Failed to parse Dynadot response: ${JSON.stringify(parsedXml)}`
            )
            return {
                status: DomainStatus.UNKNOWN
            }
        }

        // Extract domain availability status
        const status =
            searchHeader.Available === "yes"
                ? DomainStatus.AVAILABLE
                : DomainStatus.TAKEN

        // Extract pricing details if available
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

        this.logger.debug(
            `Parsed domain status: ${status}, Pricing: ${JSON.stringify(pricing)}`
        )

        return { status, pricing }
    }

    // Utility function to parse XML string to JSON object
    private parseStringPromise = (
        xml: string,
        options: object
    ): Promise<DynadotSearchResponse | null> =>
        new Promise(resolve => {
            parseString(xml, options, (err, result: DynadotSearchResponse) => {
                if (err) {
                    this.logger.error(`Error parsing XML: ${err.message}`)
                    resolve(null)
                } else {
                    resolve(result)
                }
            })
        })
}
