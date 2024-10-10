import { Injectable, Logger } from "@nestjs/common"
import { err, ok, Result } from "neverthrow"
import { CheckDomainAvailabilityDto } from "./dto/domain-availability.dto"
import { DomainAvailabilityError } from "./error"
import {
    DomainAvailabilityResult,
    ICheckDomainAvailabilityStrategyResults,
    IDomainAvailabilityStrategy
} from "./interfaces/IDomainAvailability"

@Injectable()
export class DomainAvailabilityService
    implements ICheckDomainAvailabilityStrategyResults
{
    private readonly logger = new Logger(DomainAvailabilityService.name)

    constructor(private readonly strategies: IDomainAvailabilityStrategy[]) {}

    public async check({
        domain
    }: CheckDomainAvailabilityDto): Promise<
        Result<
            Record<string, DomainAvailabilityResult>,
            DomainAvailabilityError
        >
    > {
        const results: Record<string, DomainAvailabilityResult> = {}
        const errors: string[] = []

        for (const strategy of this.strategies) {
            const result = await strategy.check({ domain })

            if (result.isOk()) {
                results[strategy.constructor.name] = result.value
            } else {
                errors.push(
                    `Strategy ${strategy.constructor.name} failed: ${result.error.message}`
                )
            }
        }

        if (Object.keys(results).length === 0) {
            return err(
                new Error(
                    "No strategies succeeded. Errors: " + errors.join(", ")
                )
            )
        }

        return ok(results)
    }
}
