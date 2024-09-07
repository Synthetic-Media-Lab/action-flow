import {
    Controller,
    Post,
    Body,
    HttpException,
    Inject,
    Logger,
    ValidationPipe,
    UsePipes
} from "@nestjs/common"
import { Result } from "pratica"
import { CreateAIPromptDto } from "./dto/create-ai-prompt.dto"
import { IAI } from "./interface/IAI"
import { AI_SERVICE_TOKEN } from "./ai.providers"

@Controller("ai")
export class AIController {
    private readonly logger = new Logger(AIController.name)

    constructor(
        @Inject(AI_SERVICE_TOKEN)
        private readonly aiService: IAI
    ) {}

    @Post("generate-text")
    @UsePipes(new ValidationPipe())
    async generateText(
        @Body() createAIPromptDto: CreateAIPromptDto
    ): Promise<string> {
        const { prompt } = createAIPromptDto

        this.logger.log(`Received prompt: ${prompt}`)

        const result: Result<string, Error> =
            await this.aiService.generateText(prompt)

        return result.cata({
            Ok: (text: string) => text,
            Err: (error: Error) => {
                this.logger.error(`Failed to generate text: ${error.message}`)
                throw new HttpException(error.message, 500)
            }
        })
    }
}
