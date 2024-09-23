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
import { CoreMessage } from "ai"
import { brandAnalysisSchema } from "src/public/actions/kh/ai-brand-analysis/schema/brand-analysis-schema"
import { SystemMessage } from "./decorators/system-message.decorator"
import {
    AiGenerateObjectDto,
    AiGenerateTextDto
} from "./dto/create-ai-prompt.dto"
import { GenAIError } from "./error/gen-ai.error"
import { FunctionTools } from "./functions/function-handlers"
import { GEN_AI_SERVICE_TOKEN } from "./gen-ai.provider"
import { EnforceServerSystemMessageGuard } from "./guards/enforce-server-system-message.guard"
import { IGenAI } from "./interface/gen-ai.interface"
import { GenerateTextResponse } from "./types/types"

interface AIRequestBody {
    system?: string
}

@Controller("gen-ai")
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
        @Body() aiGenerateTextDto: AiGenerateTextDto,
        @Req() req: { body: AIRequestBody }
    ): Promise<GenerateTextResponse> {
        this.logger.debug(
            `Received body: ${JSON.stringify(aiGenerateTextDto, null, 2)}`
        )

        const { messages } = aiGenerateTextDto

        const updatedMessages = this.addSystemMessage(messages, req)

        this.logger.debug(
            `Using messages: ${JSON.stringify(updatedMessages, null, 2)}`
        )

        const result = await this.genAIService.generateText(updatedMessages, {
            temperature: aiGenerateTextDto.temperature,
            maxTokens: aiGenerateTextDto.maxTokens,
            stopSequences: aiGenerateTextDto.stopSequences,
            presencePenalty: aiGenerateTextDto.presencePenalty,
            frequencyPenalty: aiGenerateTextDto.frequencyPenalty
        })

        return result.match(
            response => {
                this.logger.debug(
                    `Result: ${JSON.stringify(response.responseMessages, null, 2)}`
                )

                return response.responseMessages.length > 0
                    ? response.responseMessages
                    : { message: "No text generated." }
            },
            (error: GenAIError) => {
                this.logger.error(`Failed to generate text: ${error.message}`)

                throw new HttpException(error.message, 500)
            }
        )
    }

    @Post("generate-object")
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async generateObject(@Body() body: AiGenerateObjectDto): Promise<unknown> {
        this.logger.debug(
            `Received body for object generation: ${JSON.stringify(body, null, 2)}`
        )

        const { prompt } = body

        const result = await this.genAIService.generateObject({
            prompt,
            schema: brandAnalysisSchema,
            temperature: 0.5,
            output: "object"
        })

        return result.match(
            response => {
                this.logger.debug(
                    `Generated object: ${JSON.stringify(response, null, 2)}`
                )
                return response.object
            },
            (error: GenAIError) => {
                this.logger.error(`Failed to generate object: ${error.message}`)
                throw new HttpException(error.message, 500)
            }
        )
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
