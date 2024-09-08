import { Injectable, Logger } from "@nestjs/common"
import { Result, Ok, Err } from "pratica"
import { AIError } from "../../error/ai.error"
import OpenAI from "openai"
import { ConfigService } from "@nestjs/config"
import { AICustomOptions, AIGenericResponse, IAI } from "../../interface/IAI"
import { AIFunctionCallService } from "src/private/ai-function-call/ai-function-call.service"
import { getWeatherSchema } from "src/private/ai-function-call/function-definitions/get-weather.schema"

@Injectable()
export class OpenAIService
    implements IAI<OpenAI.Chat.Completions.ChatCompletion, unknown>
{
    private readonly openai: OpenAI
    private readonly logger = new Logger(OpenAIService.name)
    private readonly model: string

    constructor(
        private readonly configService: ConfigService,
        private readonly aiFunctionCallService: AIFunctionCallService
    ) {
        const apiKey = this.configService.get<string>("OPENAI_API_KEY")
        this.model = this.configService.get<string>("OPENAI_MODEL")

        if (!apiKey) {
            this.logger.error("OpenAI API key is missing in the configuration")
            throw new Error("OpenAI API key is missing")
        }

        if (!this.model) {
            this.logger.error("OpenAI model is missing in the configuration")
            throw new Error("OpenAI model is missing")
        }

        this.openai = new OpenAI({
            apiKey
        })
    }

    public async generateText(
        prompt: string,
        options: AICustomOptions = {}
    ): Promise<
        Result<
            AIGenericResponse<OpenAI.Chat.Completions.ChatCompletion, unknown>,
            AIError
        >
    > {
        const {
            systemMessage = "You are a helpful assistant.",
            temperature = 0.7,
            maxTokens = 100
        } = options

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: prompt }
                ],
                temperature,
                max_tokens: maxTokens
            })

            this.logger.debug(
                `Chat completion: ${JSON.stringify(completion, null, 2)}`
            )

            const message = completion.choices[0]?.message?.content || ""

            return Ok({
                rawResponse: completion,
                generatedText: message
            })
        } catch (error) {
            this.logger.error(`Failed to generate text: ${error.message}`)

            return Err(new AIError("Failed to generate text using OpenAI"))
        }
    }

    public async generateTextWithTools(
        prompt: string,
        options: AICustomOptions = {}
    ): Promise<
        Result<
            AIGenericResponse<OpenAI.Chat.Completions.ChatCompletion, unknown>,
            AIError
        >
    > {
        const {
            systemMessage = "You are a helpful assistant.",
            temperature = 0.7,
            maxTokens = 100
        } = options

        try {
            const completion = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: prompt }
                ],
                temperature,
                max_tokens: maxTokens,
                functions: [getWeatherSchema],
                function_call: "auto"
            })

            this.logger.debug(
                `Chat completion: ${JSON.stringify(completion, null, 2)}`
            )

            const message = completion.choices[0]?.message?.content || ""

            const toolCall = this.aiFunctionCallService.parseToolCall(message)

            return Ok({
                rawResponse: completion,
                generatedText: message,
                toolCall: toolCall.cata({
                    Just: toolCall => toolCall,
                    Nothing: () => undefined
                })
            })
        } catch (error) {
            this.logger.error(`Failed to generate text: ${error.message}`)

            return Err(new AIError("Failed to generate text using OpenAI"))
        }
    }
}
