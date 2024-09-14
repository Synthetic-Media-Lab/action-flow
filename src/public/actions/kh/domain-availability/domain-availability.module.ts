import { Module } from "@nestjs/common"
import { DomainAvailabilityController } from "./domain-availability.controller"
import { domainAvailabilityServiceProvider } from "./domain-availability.providers"

@Module({
    imports: [],
    controllers: [DomainAvailabilityController],
    providers: [domainAvailabilityServiceProvider],
    exports: [domainAvailabilityServiceProvider]
})
export class DomainAvailabilityModule {}
