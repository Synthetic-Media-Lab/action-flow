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
        params: CheckDomainAvailabilityDto
    ): Promise<
        Result<
            Record<string, MultiDomainAvailabilityResult>,
            DomainAvailabilityError
        >
    >
}

export interface IDomainAvailabilityStrategy {
    check(dto: {
        domainName: string
    }): Promise<Result<DomainAvailabilityResult, DomainAvailabilityError>>
}

export enum DomainStatus {
    AVAILABLE = "available",
    TAKEN = "taken",
    UNKNOWN = "unknown"
}

export interface DomainAvailabilityResult {
    domain: string
    status: "available" | "taken" | "unknown"
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

export interface MultiDomainAvailabilityResult {
    [tld: string]: DomainAvailabilityResult
}
