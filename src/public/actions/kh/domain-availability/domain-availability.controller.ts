import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Inject,
    Logger,
    Query,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import { DOMAIN_AVAILABILITY_SERVICE_TOKEN } from "./domain-availability.providers"
import { CheckDomainAvailabilityDto } from "./dto/domain-availability.dto"
import {
    ICheckDomainAvailabilityStrategyResults,
    MultiDomainAvailabilityResult
} from "./interfaces/IDomainAvailability"

@Controller("domain-availability")
export class DomainAvailabilityController {
    private readonly logger: Logger

    constructor(
        @Inject(DOMAIN_AVAILABILITY_SERVICE_TOKEN)
        private readonly domainAvailabilityService: ICheckDomainAvailabilityStrategyResults
    ) {
        this.logger = new Logger(DomainAvailabilityController.name)
    }

    @Get("check")
    @UsePipes(new ValidationPipe({ transform: true }))
    async check(
        @Query() checkDomainAvailabilityDto: CheckDomainAvailabilityDto
    ): Promise<Record<string, MultiDomainAvailabilityResult>> {
        const { domainName } = checkDomainAvailabilityDto

        this.logger.debug(`Received domain name: ${domainName}`)

        const result = await this.domainAvailabilityService.check(
            checkDomainAvailabilityDto
        )

        return result.match(
            result => {
                this.logger.debug(
                    `Domain availability results: ${JSON.stringify(result, null, 2)}`
                )
                return result
            },
            error => {
                this.logger.error(
                    `Error checking domain availability: ${error.message}`
                )
                throw new HttpException(
                    { status: HttpStatus.BAD_REQUEST, error: error.message },
                    HttpStatus.BAD_REQUEST
                )
            }
        )
    }
}
