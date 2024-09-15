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
import { CoreMessage, GenerateTextResult } from "ai"
import { Result } from "pratica"
import { SystemMessage } from "./decorators/system-message.decorator"
import { AiGenerateTextDto } from "./dto/create-ai-prompt.dto"
import { GenAIError } from "./error/gen-ai.error"
import { FunctionTools } from "./functions/function-handlers"
import { GEN_AI_SERVICE_TOKEN } from "./gen-ai.provider"
import { EnforceServerSystemMessageGuard } from "./guards/enforce-server-system-message.guard"
import { GenerateTextResponse, IGenAI } from "./interface/gen-ai.interface"

interface AIRequestBody {
    system?: string
}

@Controller("gen-ai")
/* @UseInterceptors(OpenAIMessageInterceptor) */
export class OpenAIController {
    private readonly logger = new Logger(OpenAIController.name)

    constructor(
        @Inject(GEN_AI_SERVICE_TOKEN)
        private readonly genAIService: IGenAI<FunctionTools>
    ) {}

    @Post("generate-text")
    @UseGuards(EnforceServerSystemMessageGuard)
    @SystemMessage("You are a helpful ActionFlow assistant")
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async generateText(
        @Body() AiGenerateTextDto: AiGenerateTextDto,
        @Req() req: { body: AIRequestBody }
    ): Promise<GenerateTextResponse> {
        this.logger.debug(
            `Received body: ${JSON.stringify(AiGenerateTextDto, null, 2)}`
        )

        const { messages } = AiGenerateTextDto

        const updatedMessages = this.addSystemMessage(messages, req)

        this.logger.debug(
            `Using messages: ${JSON.stringify(updatedMessages, null, 2)}`
        )

        const result: Result<
            GenerateTextResult<FunctionTools>,
            GenAIError
        > = await this.genAIService.generateText(updatedMessages)

        return result.cata({
            Ok: (response: GenerateTextResult<FunctionTools>) => {
                this.logger.debug(
                    `Result: ${JSON.stringify(response.responseMessages, null, 2)}`
                )

                return response.responseMessages.length > 0
                    ? response.responseMessages
                    : { message: "No text generated." }
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
