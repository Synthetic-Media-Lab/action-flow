import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Inject,
    Logger,
    Post,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import { ACTION_A_SERVICE_TOKEN } from "./action-a.providers"
import { CreateActionADto } from "./dto/create-action-a.dto"
import { IActionA } from "./interfaces/IActionA"

@Controller("action-a")
export class ActionAController {
    private readonly logger: Logger

    constructor(
        @Inject(ACTION_A_SERVICE_TOKEN)
        private readonly actionAService: IActionA
    ) {
        this.logger = new Logger(ActionAController.name)
    }

    @Post()
    @UsePipes(new ValidationPipe())
    async execute(@Body() createActionADto: CreateActionADto): Promise<string> {
        const result = this.actionAService.executeActionA(createActionADto)

        return result.match(
            successMessage => successMessage,
            error => {
                this.logger.error(`Error executing action: ${error.message}`)

                throw new HttpException(
                    {
                        status: HttpStatus.BAD_REQUEST,
                        error: error.message
                    },
                    HttpStatus.BAD_REQUEST
                )
            }
        )
    }

    @Post("async")
    @UsePipes(new ValidationPipe())
    async executeAsync(
        @Body() createActionADto: CreateActionADto
    ): Promise<string> {
        const result =
            await this.actionAService.executeAsyncActionA(createActionADto)

        return result.match(
            data => data,
            error => {
                switch (error.type) {
                    case "action-a":
                        this.logger.error(`Action A Error: ${error.message}`)

                        throw new HttpException(
                            {
                                status: HttpStatus.BAD_REQUEST,
                                error: `Action A Error: ${error.message}`
                            },
                            HttpStatus.BAD_REQUEST
                        )

                    case "not-found":
                        this.logger.error(`Not Found: ${error.message}`)

                        throw new HttpException(
                            {
                                status: HttpStatus.NOT_FOUND,
                                error: `Not Found: ${error.message}`
                            },
                            HttpStatus.NOT_FOUND
                        )

                    default:
                        this.logger.error("Unexpected Error")

                        throw new HttpException(
                            {
                                status: HttpStatus.INTERNAL_SERVER_ERROR,
                                error: "Unexpected Error"
                            },
                            HttpStatus.INTERNAL_SERVER_ERROR
                        )
                }
            }
        )
    }
}
