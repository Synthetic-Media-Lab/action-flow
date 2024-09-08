import {
    Body,
    Controller,
    HttpException,
    Inject,
    Logger,
    Post,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import { AI_SERVICE_TOKEN } from "./ai.provider"
import { CreateAICustomPromptDto } from "./dto/create-ai-prompt.dto"
import { AIGenericResponse, IAI } from "./interface/IAI"
import { Result } from "pratica"
import { AIError } from "./error/ai.error"

@Controller("ai")
export class AIController {
    private readonly logger = new Logger(AIController.name)

    constructor(
        @Inject(AI_SERVICE_TOKEN)
        private readonly aiService: IAI<unknown, unknown>
    ) {}

    @Post("generate-text")
    @UsePipes(new ValidationPipe())
    async generateText(
        @Body() createAICustomPromptDto: CreateAICustomPromptDto
    ): Promise<string> {
        const { prompt, systemMessage, temperature, maxTokens } =
            createAICustomPromptDto

        this.logger.debug(`Received prompt: ${prompt}`)

        const result: Result<
            AIGenericResponse<unknown, unknown>,
            AIError
        > = await this.aiService.generateText(prompt, {
            systemMessage,
            temperature,
            maxTokens
        })

        return result.cata({
            Ok: (response: AIGenericResponse<unknown, unknown>) => {
                return response.generatedText || "No text generated."
            },
            Err: (error: AIError) => {
                this.logger.error(`Failed to generate text: ${error.message}`)

                throw new HttpException(error.message, 500)
            }
        })
    }

    @Post("generate-text-with-tools")
    @UsePipes(new ValidationPipe())
    async generateTextWithTools(
        @Body() createAICustomPromptDto: CreateAICustomPromptDto
    ): Promise<string> {
        const { prompt, systemMessage, temperature, maxTokens } =
            createAICustomPromptDto

        this.logger.debug(`Received prompt: ${prompt}`)

        const result: Result<
            AIGenericResponse<unknown, unknown>,
            AIError
        > = await this.aiService.generateTextWithTools(prompt, {
            systemMessage,
            temperature,
            maxTokens
        })

        return result.cata({
            Ok: (response: AIGenericResponse<unknown, unknown>) => {
                return response.generatedText || "No text generated."
            },
            Err: (error: AIError) => {
                this.logger.error(`Failed to generate text: ${error.message}`)

                throw new HttpException(error.message, 500)
            }
        })
    }
}
