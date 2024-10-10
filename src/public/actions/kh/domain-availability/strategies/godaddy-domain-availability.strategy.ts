import { Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { ok, Result } from "neverthrow"
import { CheckDomainAvailabilityDto } from "../dto/domain-availability.dto"
import { DomainAvailabilityError } from "../error"
import { formatErrorForLogging } from "src/shared/pure-utils/pure-utils"
import { FetchService } from "src/private/fetch/fetch.service"
import {
    DomainAvailabilityResult,
    DomainStatus,
    IDomainAvailabilityStrategy
} from "../interfaces/IDomainAvailability"
import { GoDaddyResponse } from "../types/godaddy"

@Injectable()
export class GoDaddyDomainAvailabilityStrategy
    implements IDomainAvailabilityStrategy
{
    private readonly logger = new Logger(GoDaddyDomainAvailabilityStrategy.name)
    private readonly apiKey: string
    private readonly apiUrl: string

    constructor(
        private readonly configService: ConfigService,
        private readonly fetchService: FetchService
    ) {
        this.apiKey = this.configService.get<string>("GODADDY_API_KEY") ?? ""
        this.apiUrl = this.configService.get<string>("GODADDY_API_URL") ?? ""
    }

    public async check({
        domainName
    }: CheckDomainAvailabilityDto): Promise<
        Result<DomainAvailabilityResult, DomainAvailabilityError>
    > {
        this.logger.debug(
            `Checking domain availability with GoDaddy for: ${domainName}`
        )

        try {
            const response = await this.fetchDomainAvailability(domainName)

            return ok(this.parseGoDaddyResponse(response, domainName))
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(`Error with GoDaddy: ${message}`)

            const errorResult = this.createErrorResult(domainName, message)

            return ok(errorResult)
        }
    }

    private async fetchDomainAvailability(
        domain: string
    ): Promise<GoDaddyResponse> {
        const url = `${this.apiUrl}?domain=${domain}`

        this.logger.debug(`Fetching domain availability from URL: ${url}`)

        const result = await this.fetchService.json<GoDaddyResponse>(url, {
            headers: {
                Authorization: `sso-key ${this.apiKey}`
            }
        })

        if (result.isErr()) {
            const errorMessage = result.error.responseBody
                ? `Failed to fetch from GoDaddy: ${result.error.message}. Response body: ${result.error.responseBody}`
                : `Failed to fetch from GoDaddy: ${result.error.message}`

            this.logger.error(errorMessage)

            throw new Error(errorMessage)
        }

        this.logger.debug(
            `Raw GoDaddy response: ${JSON.stringify(result.value)}`
        )

        return result.value
    }

    private parseGoDaddyResponse(
        response: GoDaddyResponse,
        domain: string
    ): DomainAvailabilityResult {
        if (response.code) {
            return this.createErrorResult(
                domain,
                response.message || response.code,
                response
            )
        }

        const status = response.available
            ? DomainStatus.AVAILABLE
            : DomainStatus.TAKEN

        return {
            domain,
            status,
            provider: "GoDaddy",
            pricing: response.price
                ? {
                      registrationPrice: response.price / 1000000,
                      renewalPrice: response.price / 1000000,
                      currency: response.currency || "USD"
                  }
                : undefined,
            rawData: [JSON.stringify(response)]
        }
    }

    private createErrorResult(
        domain: string,
        errorMessage: string,
        response?: GoDaddyResponse
    ): DomainAvailabilityResult {
        return {
            domain,
            status: DomainStatus.UNKNOWN,
            provider: "GoDaddy",
            rawData: [
                JSON.stringify({
                    errorMessage,
                    response
                })
            ]
        }
    }
}
