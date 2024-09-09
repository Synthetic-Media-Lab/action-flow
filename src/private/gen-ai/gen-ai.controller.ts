import {
    Body,
    Controller,
    HttpException,
    Inject,
    Logger,
    Post,
    Req,
    UseGuards,
    UsePipes,
    ValidationPipe
} from "@nestjs/common"
import { Result } from "pratica"
import { CreateAICustomPromptDto } from "./dto/create-ai-prompt.dto"
import { GenAIError } from "./error/gen-ai.error"
import { GEN_AI_SERVICE_TOKEN } from "./gen-ai.provider"
import { IGenAI } from "./interface/gen-ai.interface"
import { CoreMessage, GenerateTextResult } from "ai"
import { getWeatherTool } from "./functions/function-handlers/get-weather.handler"
import { EnforceServerSystemMessageGuard } from "./guards/enforce-server-system-message.guard"
import { SystemMessage } from "./decorators/system-message.decorator"

type AITools = {
    getWeather: typeof getWeatherTool
}

interface AIRequestBody {
    system?: string
}

@Controller("gen-ai")
export class AIController {
    private readonly logger = new Logger(AIController.name)

    constructor(
        @Inject(GEN_AI_SERVICE_TOKEN)
        private readonly genAIService: IGenAI<AITools>
    ) {}

    @Post("generate-text")
    @UseGuards(EnforceServerSystemMessageGuard)
    @SystemMessage("Pretend you are a tiger 🐯.")
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async generateText(
        @Body() createAICustomPromptDto: CreateAICustomPromptDto,
        @Req() req: { body: AIRequestBody }
    ): Promise<string> {
        this.logger.debug(
            `Received body: ${JSON.stringify(createAICustomPromptDto, null, 2)}`
        )

        const { messages } = createAICustomPromptDto

        const updatedMessages = this.addSystemMessage(messages, req)

        this.logger.debug(
            `Using messages: ${JSON.stringify(updatedMessages, null, 2)}`
        )

        const result: Result<
            GenerateTextResult<AITools>,
            GenAIError
        > = await this.genAIService.generateText(updatedMessages)

        this.logger.debug(`Result: ${JSON.stringify(result, null, 2)}`)

        return result.cata({
            Ok: (response: GenerateTextResult<AITools>) => {
                const generatedText = response.text || "No text generated."
                return generatedText
            },
            Err: (error: GenAIError) => {
                this.logger.error(`Failed to generate text: ${error.message}`)
                throw new HttpException(error.message, 500)
            }
        })
    }

    private addSystemMessage(
        messages: CoreMessage[],
        req: { body: AIRequestBody }
    ): CoreMessage[] {
        const hasSystemMessage = messages.some(
            message => message.role === "system"
        )

        if (!hasSystemMessage) {
            const systemMessage: CoreMessage = {
                role: "system",
                content: this.getSystemMessageFromGuardOrDefault(req)
            }
            return [systemMessage, ...messages]
        }

        return messages
    }

    private getSystemMessageFromGuardOrDefault(req: {
        body: AIRequestBody
    }): string {
        if (req.body.system) {
            return req.body.system
        }
        return "You are a friendly assistant!"
    }
}
