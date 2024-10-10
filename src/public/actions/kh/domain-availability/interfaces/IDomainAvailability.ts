import { Result } from "neverthrow"
import { CheckDomainAvailabilityDto } from "../dto/domain-availability.dto"
import { DomainAvailabilityError } from "../error"

export interface ICheckDomainAvailability {
    check(
        dto: CheckDomainAvailabilityDto
    ): Promise<Result<DomainAvailabilityResult, DomainAvailabilityError>>
}

export interface ICheckDomainAvailabilityStrategyResults {
    check(
        dto: CheckDomainAvailabilityDto
    ): Promise<
        Result<
            Record<string, DomainAvailabilityResult>,
            DomainAvailabilityError
        >
    >
}

export interface IDomainAvailabilityStrategy extends ICheckDomainAvailability {}

export enum DomainStatus {
    AVAILABLE = "available",
    TAKEN = "taken",
    UNKNOWN = "unknown"
}

export interface DomainAvailabilityResult {
    domain: string
    status: DomainStatus
    provider: string
    pricing?: {
        registrationPrice?: number
        renewalPrice?: number
        currency?: string
    }
    createdDate?: string
    expiryDate?: string
    updatedDate?: string
    registrar?: {
        name: string
        url?: string
        abuseContactEmail?: string
        abuseContactPhone?: string
    }
    nameServers?: string[]
    dnssec?: string
    rawData?: string[]
}
