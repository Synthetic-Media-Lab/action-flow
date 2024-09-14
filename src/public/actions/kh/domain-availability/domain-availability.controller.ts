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
    DomainAvailabilityResult,
    IDomainAvailability
} from "./interfaces/IDomainAvailability"

@Controller("domain-availability")
export class DomainAvailabilityController {
    private readonly logger: Logger

    constructor(
        @Inject(DOMAIN_AVAILABILITY_SERVICE_TOKEN)
        private readonly domainAvailabilityService: IDomainAvailability
    ) {
        this.logger = new Logger(DomainAvailabilityController.name)
    }

    @Get("check")
    @UsePipes(new ValidationPipe({ transform: true }))
    async check(
        @Query() checkDomainAvailabilityDto: CheckDomainAvailabilityDto
    ): Promise<DomainAvailabilityResult> {
        const { domain } = checkDomainAvailabilityDto

        this.logger.debug(`Received domain: ${domain}`)

        const result = this.domainAvailabilityService.check(
            checkDomainAvailabilityDto
        )

        return result.cata({
            Ok: result => result,
            Err: error => {
                this.logger.error(
                    `Error checking domain availability: ${error.message}`
                )

                throw new HttpException(
                    {
                        status: HttpStatus.BAD_REQUEST,
                        error: error.message
                    },
                    HttpStatus.BAD_REQUEST
                )
            }
        })
    }
}
