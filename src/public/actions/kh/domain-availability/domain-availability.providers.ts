import { DomainAvailabilityService } from "./domain-availability.service"

export const DOMAIN_AVAILABILITY_SERVICE_TOKEN =
    "DOMAIN_AVAILABILITY_SERVICE_TOKEN"

export const domainAvailabilityServiceProvider = {
    provide: DOMAIN_AVAILABILITY_SERVICE_TOKEN,
    useClass: DomainAvailabilityService
}
