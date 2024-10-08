import { Module } from "@nestjs/common"
import { DomainAvailabilityController } from "./domain-availability.controller"
import { domainAvailabilityServiceFactory } from "./domain-availability.providers"
import { WhoiserDomainAvailabilityStrategy } from "./strategies/whoiser-domain-availability.strategy"
import { DynadotDomainAvailabilityStrategy } from "./strategies/dynadot-domain-availability.strategy"
import { GoDaddyDomainAvailabilityStrategy } from "./strategies/godaddy-domain-availability.strategy"
import { FetchModule } from "src/private/fetch/fetch.module"

@Module({
    imports: [FetchModule],
    controllers: [DomainAvailabilityController],
    providers: [
        domainAvailabilityServiceFactory,
        WhoiserDomainAvailabilityStrategy,
        DynadotDomainAvailabilityStrategy,
        GoDaddyDomainAvailabilityStrategy
    ],
    exports: [domainAvailabilityServiceFactory]
})
export class DomainAvailabilityModule {}
