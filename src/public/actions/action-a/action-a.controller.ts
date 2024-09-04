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
import { IActionA } from "./interfaces/IActionA"
import { CreateActionADto } from "./dto/create-action-a.dto"
import { ActionAError } from "./error/action-a.error"

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

        return result.fold(
            successMessage => successMessage,
            (error: ActionAError) => {
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

        return result.fold(
            successMessage => successMessage,
            (error: ActionAError) => {
                this.logger.error(
                    `Error executing async action: ${error.message}`
                )

                throw new HttpException(
                    {
                        status: HttpStatus.INTERNAL_SERVER_ERROR,
                        error: error.message
                    },
                    HttpStatus.INTERNAL_SERVER_ERROR
                )
            }
        )
    }
}
