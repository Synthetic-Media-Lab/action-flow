import { Injectable, Logger } from "@nestjs/common"
import { err, ok, Result } from "neverthrow"
import { CheckDomainAvailabilityDto } from "./dto/domain-availability.dto"
import { DomainAvailabilityError } from "./error"
import {
    MultiDomainAvailabilityResult,
    ICheckDomainAvailabilityStrategyResults,
    IDomainAvailabilityStrategy
} from "./interfaces/IDomainAvailability"

@Injectable()
export class DomainAvailabilityService
    implements ICheckDomainAvailabilityStrategyResults
{
    private readonly logger = new Logger(DomainAvailabilityService.name)
    private readonly tlds: string[]

    constructor(private readonly strategies: IDomainAvailabilityStrategy[]) {
        this.tlds = process.env.TLDS?.split(",") || [
            ".com",
            ".se",
            ".fi",
            ".no"
        ]
    }

    public async check({
        domainName
    }: CheckDomainAvailabilityDto): Promise<
        Result<
            Record<string, MultiDomainAvailabilityResult>,
            DomainAvailabilityError
        >
    > {
        const results: Record<string, MultiDomainAvailabilityResult> = {}
        const errors: string[] = []

        for (const strategy of this.strategies) {
            const strategyResults: MultiDomainAvailabilityResult = {}

            for (const tld of this.tlds) {
                const fullDomain = `${domainName}${tld}`
                const result = await strategy.check({ domainName: fullDomain })

                if (result.isOk()) {
                    strategyResults[tld] = result.value
                } else {
                    errors.push(
                        `Strategy ${strategy.constructor.name} failed for ${fullDomain}: ${result.error.message}`
                    )
                }
            }

            if (Object.keys(strategyResults).length > 0) {
                results[strategy.constructor.name] = strategyResults
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
