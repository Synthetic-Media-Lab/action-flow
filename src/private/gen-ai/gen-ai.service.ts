import { openai } from "@ai-sdk/openai"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
    CoreMessage,
    CoreTool,
    generateText,
    GenerateTextResult,
    LanguageModelV1
} from "ai"
import { Err, Ok, Result } from "pratica"
import { GenAIError } from "./error/gen-ai.error"
import { IGenAI } from "./interface/gen-ai.interface"
import { CallSettings, OpenAIChatModelId } from "./types/types"

@Injectable()
export class GenAIService<TOOLS extends Record<string, CoreTool>>
    implements IGenAI<TOOLS>
{
    private readonly logger = new Logger(GenAIService.name)
    private readonly model: OpenAIChatModelId
    private readonly openai: LanguageModelV1

    constructor(
        private readonly configService: ConfigService,
        @Inject("FUNCTION_HANDLERS")
        private readonly tools: Record<string, CoreTool>
    ) {
        const apiKey = this.configService.get<LanguageModelV1>("OPENAI_API_KEY")
        this.model = this.configService.get<OpenAIChatModelId>("OPENAI_MODEL")

        if (!apiKey) {
            this.logger.error("OpenAI API key is missing in the configuration")
            throw new Error("OpenAI API key is missing")
        }

        if (!this.model) {
            this.logger.error("OpenAI model is missing in the configuration")
            throw new Error("OpenAI model is missing")
        }

        this.openai = openai(this.model)
    }

    public async generateText(
        messages: CoreMessage[],
        options: CallSettings & { tools?: TOOLS } = {}
    ): Promise<Result<GenerateTextResult<TOOLS>, GenAIError>> {
        try {
            this.logger.debug(
                `Using messages: ${JSON.stringify(messages, null, 2)}`
            )

            const result: GenerateTextResult<TOOLS> = await generateText({
                model: this.openai,
                messages: messages,
                tools: this.tools,
                temperature: options.temperature,
                maxTokens: options.maxTokens,
                stopSequences: options.stopSequences,
                presencePenalty: options.presencePenalty,
                frequencyPenalty: options.frequencyPenalty,
                maxToolRoundtrips: 1
            })

            const { responseMessages, toolResults, finishReason, toolCalls } =
                result

            this.logger.debug(
                `Response messages: ${JSON.stringify(responseMessages, null, 2)}`
            )
            this.logger.debug(
                `Finish reason: ${JSON.stringify(finishReason, null, 2)}`
            )
            this.logger.debug(
                `Tool results: ${JSON.stringify(toolResults, null, 2)}`
            )
            this.logger.debug(
                `Tool calls: ${JSON.stringify(toolCalls, null, 2)}`
            )

            return Ok(result)
        } catch (error) {
            this.logger.error(`Failed to generate text: ${error.message}`)

            return Err(
                new GenAIError("Failed to generate text using Vercel AI")
            )
        }
    }
}
