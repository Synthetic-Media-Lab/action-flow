import { DomainAvailabilityService } from "./domain-availability.service"
import { DynadotDomainAvailabilityStrategy } from "./strategies/dynadot-domain-availability.strategy"
import { WhoiserDomainAvailabilityStrategy } from "./strategies/whoiser-domain-availability.strategy"
import { GoDaddyDomainAvailabilityStrategy } from "./strategies/godaddy-domain-availability.strategy"

export const DOMAIN_AVAILABILITY_SERVICE_TOKEN =
    "DOMAIN_AVAILABILITY_SERVICE_TOKEN"

export const domainAvailabilityServiceFactory = {
    provide: DOMAIN_AVAILABILITY_SERVICE_TOKEN,
    useFactory: (
        whoiserStrategy: WhoiserDomainAvailabilityStrategy,
        dynadotStrategy: DynadotDomainAvailabilityStrategy,
        godaddyStrategy: GoDaddyDomainAvailabilityStrategy
    ) => {
        return new DomainAvailabilityService([
            /* godaddyStrategy,  */ whoiserStrategy
        ])
    },
    inject: [
        WhoiserDomainAvailabilityStrategy,
        DynadotDomainAvailabilityStrategy,
        GoDaddyDomainAvailabilityStrategy
    ]
}
