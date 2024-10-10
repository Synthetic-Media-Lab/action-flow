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
        domainName
    }: CheckDomainAvailabilityDto): Promise<
        Result<DomainAvailabilityResult, DomainAvailabilityError>
    > {
        this.logger.debug(
            `Checking domain availability with Whoiser for: ${domainName}`
        )

        try {
            const data: WhoisSearchResult = await whoiser(domainName)

            this.logger.debug("Response data: ", JSON.stringify(data, null, 2))

            if (!data || Object.keys(data).length === 0) {
                return ok(
                    this.createErrorResult(
                        domainName,
                        "No data received from Whoiser"
                    )
                )
            }

            const status = this.parseWhoiserStatus(data)
            const domainInfo = this.extractDomainInformation(data)

            if (!domainInfo) {
                return ok(
                    this.createErrorResult(domainName, "Incomplete domain info")
                )
            }

            return ok({
                domain: domainName,
                status,
                provider: "Whoiser",
                ...domainInfo
            })
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(`Error with Whoiser: ${message}`)

            const errorResult = this.createErrorResult(domainName, message)

            return ok(errorResult)
        }
    }

    private parseWhoiserStatus(data: WhoisSearchResult): DomainStatus {
        for (const key in data) {
            const record = data[key]

            if (this.isValidWhoisRecord(record)) {
                const serializedRecord = this.serializeRecord(record)

                if (this.isDomainAvailable(serializedRecord)) {
                    return DomainStatus.AVAILABLE
                }

                if (this.isDomainTaken(serializedRecord)) {
                    return DomainStatus.TAKEN
                }

                if (this.containsDate(serializedRecord)) {
                    return DomainStatus.TAKEN
                }
            }
        }

        return DomainStatus.UNKNOWN
    }

    private serializeRecord(record: WhoisRecord): string {
        return JSON.stringify(record).toLowerCase()
    }

    private isDomainAvailable(serializedRecord: string): boolean {
        return (
            serializedRecord.includes("no match") ||
            serializedRecord.includes("not found")
        )
    }

    private isDomainTaken(serializedRecord: string): boolean {
        return (
            serializedRecord.includes("registered") ||
            serializedRecord.includes("created")
        )
    }

    private containsDate(serializedRecord: string): boolean {
        return /\d{4}-\d{2}-\d{2}/.test(serializedRecord)
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
