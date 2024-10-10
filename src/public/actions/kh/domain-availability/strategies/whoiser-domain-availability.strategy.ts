import { Injectable, Logger } from "@nestjs/common"
import { ok, Result } from "neverthrow"
import { formatErrorForLogging } from "src/shared/pure-utils/pure-utils"
import whoiser from "whoiser"
import { CheckDomainAvailabilityDto } from "../dto/domain-availability.dto"
import { DomainAvailabilityError } from "../error"
import {
    DomainAvailabilityResult,
    DomainStatus,
    IDomainAvailabilityStrategy
} from "../interfaces/IDomainAvailability"
import { WhoisRecord, WhoisSearchResult } from "../types/whoiser"

@Injectable()
export class WhoiserDomainAvailabilityStrategy
    implements IDomainAvailabilityStrategy
{
    private readonly logger = new Logger(WhoiserDomainAvailabilityStrategy.name)

    public async check({
        domain
    }: CheckDomainAvailabilityDto): Promise<
        Result<DomainAvailabilityResult, DomainAvailabilityError>
    > {
        this.logger.debug(
            `Checking domain availability with Whoiser for: ${domain}`
        )

        try {
            const data: WhoisSearchResult = await whoiser(domain)

            if (!data) {
                return ok(
                    this.createErrorResult(
                        domain,
                        "No data received from Whoiser"
                    )
                )
            }

            const status = this.parseWhoiserStatus(data)
            const domainInfo = this.extractDomainInformation(data)

            if (!domainInfo) {
                return ok(
                    this.createErrorResult(domain, "Incomplete domain info")
                )
            }

            return ok({
                domain,
                status,
                provider: "Whoiser",
                ...domainInfo
            })
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(`Error with Whoiser: ${message}`)

            const errorResult = this.createErrorResult(domain, message)

            return ok(errorResult)
        }
    }

    private parseWhoiserStatus(data: WhoisSearchResult): DomainStatus {
        for (const key in data) {
            const record = data[key]

            if (this.isValidWhoisRecord(record)) {
                if (record["Domain Name"] && record["Created Date"]) {
                    return DomainStatus.TAKEN
                }
            }
        }
        return DomainStatus.AVAILABLE
    }

    private extractDomainInformation(
        data: WhoisSearchResult
    ): Partial<DomainAvailabilityResult> | null {
        for (const key in data) {
            const record = data[key]

            if (this.isValidWhoisRecord(record)) {
                return {
                    createdDate: record["Created Date"] ?? "N/A",
                    expiryDate: record["Expiry Date"] ?? "N/A",
                    updatedDate: record["Updated Date"] ?? "N/A",
                    registrar: {
                        name: record["Registrar"] ?? "Unknown",
                        url: record["Registrar URL"] ?? "N/A",
                        abuseContactEmail:
                            record["Registrar Abuse Contact Email"] ?? "N/A",
                        abuseContactPhone:
                            record["Registrar Abuse Contact Phone"] ?? "N/A"
                    },
                    nameServers: record["Name Server"] ?? [],
                    dnssec: record["DNSSEC"] ?? "unsigned",
                    rawData: record.text ?? []
                }
            }
        }

        return null
    }

    private isValidWhoisRecord(record: unknown): record is WhoisRecord {
        return (
            typeof record === "object" &&
            record !== null &&
            !Array.isArray(record)
        )
    }

    private createErrorResult(
        domain: string,
        errorMessage: string,
        data?: WhoisSearchResult
    ): DomainAvailabilityResult {
        return {
            domain,
            status: DomainStatus.UNKNOWN,
            provider: "Whoiser",
            rawData: [
                JSON.stringify({
                    errorMessage,
                    data
                })
            ]
        }
    }
}
