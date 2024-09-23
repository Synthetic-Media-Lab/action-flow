import { openai } from "@ai-sdk/openai"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
    CoreMessage,
    CoreTool,
    generateObject,
    generateText,
    JSONParseError,
    JSONValue,
    LanguageModel,
    LanguageModelV1,
    TypeValidationError
} from "ai"
import { err, ok, Result } from "neverthrow"
import { formatErrorForLogging } from "src/shared/pure-utils/pure-utils"
import { GenAIError } from "../../error/gen-ai.error"
import {
    GenerateObjectOptions,
    GenerateTextOptions,
    IGenAI
} from "../../interface/gen-ai.interface"
import { OpenAIChatModelId } from "../../types/types"
import { ValidationError } from "src/error/validation.error"
import { ParseError } from "src/error/parse.error"

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

    public async generateText<TOOLS extends Record<string, CoreTool>>(
        messages: CoreMessage[],
        options: GenerateTextOptions<TOOLS> = {}
    ): Promise<Result<Awaited<ReturnType<typeof generateText>>, GenAIError>> {
        try {
            this.logger.debug(
                `Using messages: ${JSON.stringify(messages, null, 2)}`
            )

            const modelToUse: LanguageModel = options.model || this.openai
            const toolsToUse = options.tools || this.tools

            const {
                temperature,
                maxTokens,
                stopSequences,
                presencePenalty,
                frequencyPenalty
            } = options

            const result = await generateText({
                model: modelToUse,
                messages: messages,
                tools: toolsToUse,
                temperature: temperature,
                maxTokens: maxTokens,
                stopSequences: stopSequences,
                presencePenalty: presencePenalty,
                frequencyPenalty: frequencyPenalty,
                maxToolRoundtrips: 1
            })

            this.logger.debug(
                `Response messages: ${JSON.stringify(result.responseMessages, null, 2)}`
            )

            return ok(result)
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(`Failed to generate text: ${message}`)

            return err(new Error("Failed to generate text using Vercel AI"))
        }
    }

    public async generateObject<OBJECT extends JSONValue>(
        options: GenerateObjectOptions<OBJECT>
    ): Promise<Result<Awaited<ReturnType<typeof generateObject>>, GenAIError>> {
        try {
            const modelToUse = options.model || this.openai

            this.logger.debug(
                `Options passed: ${JSON.stringify(options, null, 2)}`
            )

            if ("schema" in options && options.schema) {
                const result = await generateObject<OBJECT>({
                    ...options,
                    output: "object",
                    schema: options.schema,
                    model: modelToUse
                })

                return ok(result)
            } else {
                const result = await generateObject({
                    ...options,
                    output: "no-schema",
                    model: modelToUse
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
                return err(new ValidationError("Validation error occurred"))
            } else if (error instanceof JSONParseError) {
                return err(new ParseError("Failed to parse JSON"))
            } else {
                return err(
                    new Error("Unknown error occurred during object generation")
                )
            }
        }
    }
}
