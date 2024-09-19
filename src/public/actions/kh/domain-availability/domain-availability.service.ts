import { Injectable, Logger } from "@nestjs/common"
import { err, ok, Result } from "neverthrow"
import { CheckDomainAvailabilityDto } from "./dto/domain-availability.dto"
import { DomainAvailabilityError } from "./error/domain-availability.error"
import {
    DomainAvailabilityResult,
    DomainStatus,
    IDomainAvailability
} from "./interfaces/IDomainAvailability"

@Injectable()
export class DomainAvailabilityService implements IDomainAvailability {
    private readonly logger = new Logger(DomainAvailabilityService.name)

    constructor() {}

    public check({
        domain
    }: CheckDomainAvailabilityDto): Result<
        DomainAvailabilityResult,
        DomainAvailabilityError
    > {
        this.logger.debug(`Checking domain availability for: ${domain}`)

        if (!domain) {
            return err(new DomainAvailabilityError("Domain is required"))
        }

        return ok(
            Math.random() > 0.5
                ? {
                      domain,
                      status:
                          Math.random() > 0.5
                              ? DomainStatus.AVAILABLE
                              : DomainStatus.TAKEN
                  }
                : {
                      domain,
                      status: DomainStatus.UNKNOWN
                  }
        )
    }
}
