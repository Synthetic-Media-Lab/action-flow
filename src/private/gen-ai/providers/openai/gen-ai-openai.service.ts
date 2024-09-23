import { openai } from "@ai-sdk/openai"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
    CoreMessage,
    CoreTool,
    generateObject,
    generateText,
    GenerateTextResult,
    JSONParseError,
    JSONValue,
    LanguageModelV1,
    TypeValidationError
} from "ai"
import { err, ok, Result } from "neverthrow"
import { formatErrorForLogging } from "src/shared/pure-utils/pure-utils"
import { IGenAI } from "../../interface/gen-ai.interface"
import {
    CallSettings,
    GenerateObjectOptions,
    OpenAIChatModelId
} from "../../types/types"
import { GenAIError } from "../../error/gen-ai.error"

@Injectable()
export class GenAIOpenAIService<TOOLS extends Record<string, CoreTool>>
    implements IGenAI<TOOLS>
{
    private readonly logger = new Logger(GenAIOpenAIService.name)
    private readonly model: OpenAIChatModelId
    private readonly openai: LanguageModelV1

    constructor(
        private readonly configService: ConfigService,
        @Inject("FUNCTION_HANDLERS")
        private readonly tools: Record<string, CoreTool>
    ) {
        const apiKey = this.configService.get<LanguageModelV1>("OPENAI_API_KEY")
        const model = this.configService.get<OpenAIChatModelId>("OPENAI_MODEL")

        if (!apiKey) {
            this.logger.error("OpenAI API key is missing in the configuration")
            throw new Error("OpenAI API key is missing")
        }

        if (!model) {
            this.logger.error("OpenAI model is missing in the configuration")
            throw new Error("OpenAI model is missing")
        }

        this.model = model
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

            return ok(result)
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(`Failed to generate text: ${message}`)

            return err(
                new GenAIError("Failed to generate text using Vercel AI")
            )
        }
    }

    public async generateObject<OBJECT extends JSONValue>(
        options: GenerateObjectOptions<OBJECT>
    ): Promise<Result<Awaited<ReturnType<typeof generateObject>>, GenAIError>> {
        try {
            if (options.schema) {
                const result = await generateObject<OBJECT>({
                    ...options,
                    output: "object",
                    schema: options.schema,
                    model: this.openai
                })

                return ok(result)
            } else {
                const result = await generateObject({
                    ...options,
                    output: "no-schema",
                    model: this.openai
                })

                return ok(result)
            }
        } catch (error) {
            const { message, stack } = formatErrorForLogging(error)

            this.logger.error(
                `Error during object generation: ${message}`,
                stack
            )

            if (error instanceof TypeValidationError) {
                return err(new GenAIError("Validation error occurred"))
            } else if (error instanceof JSONParseError) {
                return err(new GenAIError("Failed to parse JSON"))
            } else {
                return err(
                    new GenAIError(
                        "Unknown error occurred during object generation"
                    )
                )
            }
        }
    }
}
