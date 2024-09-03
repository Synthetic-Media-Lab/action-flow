import {
    Body,
    Controller,
    Inject,
    Logger,
    Post,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import { ACTION_A_SERVICE_TOKEN } from "./action-a.providers"
import { IActionA } from "./interfaces/IActionA"
import { CreateActionADto } from "./dto/create-action-a.dto"

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
        return this.actionAService.executeActionA(createActionADto)
    }
}
