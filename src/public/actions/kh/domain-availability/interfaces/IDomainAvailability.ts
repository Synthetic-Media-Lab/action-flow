import { Result } from "neverthrow"
import { CheckDomainAvailabilityDto } from "../dto/domain-availability.dto"
import { DomainAvailabilityError } from "../error/domain-availability.error"

export interface IDomainAvailability extends ICheckDomainAvailability {}

interface ICheckDomainAvailability {
    check(
        brand: CheckDomainAvailabilityDto
    ): Result<DomainAvailabilityResult, DomainAvailabilityError>
}

export enum DomainStatus {
    AVAILABLE = "available",
    TAKEN = "taken",
    FOR_SALE = "for-sale",
    UNKNOWN = "unknown"
}

export interface DomainAvailabilityResult {
    domain: string
    status: DomainStatus
    pricing?: {
        registrationPrice: number
        renewalPrice: number
    }
}
