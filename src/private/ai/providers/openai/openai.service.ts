import { Injectable, Logger } from "@nestjs/common"
import { Result, ok, err } from "neverthrow"
import { AIError } from "../../error/ai.error"
import OpenAI from "openai"
import { ConfigService } from "@nestjs/config"
import { AICustomOptions, AIGenericResponse, IAI } from "../../interface/IAI"
import { OpenAIFunctionCallService } from "./openai-function-call.service"
import { getWeatherSchema } from "../../ai-function-call/function-definitions/get-weather.schema"
import { formatErrorForLogging } from "src/shared/pure-utils/pure-utils"

@Injectable()
export class OpenAIService
    implements IAI<OpenAI.Chat.Completions.ChatCompletion, unknown>
{
    private readonly openai: OpenAI
    private readonly logger = new Logger(OpenAIService.name)
    private readonly model: string

    constructor(
        private readonly configService: ConfigService,
        private readonly aiFunctionCallService: OpenAIFunctionCallService
    ) {
        const apiKey = this.configService.get<string>("OPENAI_API_KEY")
        const model = this.configService.get<string>("OPENAI_MODEL")

        if (!apiKey) {
            this.logger.error("OpenAI API key is missing in the configuration")
            throw new Error("OpenAI API key is missing")
        }

        if (!model) {
            this.logger.error("OpenAI model is missing in the configuration")
            throw new Error("OpenAI model is missing")
        }

        this.model = model
        this.openai = new OpenAI({ apiKey })
    }

    public async generateText(
        input: string | OpenAI.Chat.Completions.ChatCompletion,
        options: AICustomOptions = {}
    ): Promise<
        Result<
            AIGenericResponse<OpenAI.Chat.Completions.ChatCompletion>,
            AIError
        >
    > {
        const {
            systemMessage = "You are a helpful assistant.",
            temperature = 0.7,
            maxTokens = 4096
        } = options

        try {
            const completion =
                typeof input === "string"
                    ? await this.openai.chat.completions.create({
                          model: this.model,
                          messages: [
                              { role: "system", content: systemMessage },
                              { role: "user", content: input }
                          ],
                          temperature,
                          max_tokens: maxTokens
                      })
                    : input

            this.logger.debug(
                `[generateText] Chat completion: ${JSON.stringify(completion, null, 2)}`
            )

            const message = completion?.choices?.[0]?.message?.content || ""

            return ok({
                rawResponse: completion,
                generatedText: message
            })
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(`Failed to generate text: ${message}`)

            return err(new AIError("Failed to generate text using OpenAI"))
        }
    }

    public async generateTextWithTools(
        input: string | OpenAI.Chat.Completions.ChatCompletion,
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
            const completion =
                typeof input === "string"
                    ? await this.openai.chat.completions.create({
                          model: this.model,
                          messages: [
                              { role: "system", content: systemMessage },
                              { role: "user", content: input }
                          ],
                          temperature,
                          max_tokens: maxTokens,
                          functions: [getWeatherSchema],
                          function_call: "auto"
                      })
                    : input

            this.logger.debug(
                `[generateTextWithTools] Chat completion: ${JSON.stringify(completion, null, 2)}`
            )

            const message = completion?.choices?.[0]?.message?.content || ""

            const toolCall =
                this.aiFunctionCallService.parseToolCall(completion)

            return toolCall.cata({
                Just: async toolCall => {
                    this.logger.debug(
                        `[generateTextWithTools] Tool call detected: ${toolCall.function.name}`
                    )

                    const functionCallResult =
                        await this.aiFunctionCallService.handleFunctionCall(
                            toolCall
                        )

                    return functionCallResult.match(
                        async value => {
                            this.logger.debug(
                                `[generateTextWithTools] Function call successful, structured data: ${value.generatedText}`
                            )

                            const summaryResult = await this.generateText(
                                `Here is the data: ${value.generatedText}. Summarize this information in a concise, human-friendly way.`,
                                {
                                    systemMessage:
                                        "Summarize the following data in a simple, human-friendly manner.",
                                    temperature,
                                    maxTokens
                                }
                            )

                            return summaryResult
                        },
                        error => {
                            this.logger.error(
                                `[generateTextWithTools] Function call failed: ${error.message}`
                            )
                            return err(
                                new AIError(
                                    `Function call failed: ${error.message}`
                                )
                            )
                        }
                    )
                },
                Nothing: () => {
                    this.logger.debug(
                        "[generateTextWithTools] No tool call detected"
                    )
                    return ok({
                        rawResponse: completion,
                        generatedText: message,
                        toolCall: undefined
                    })
                }
            })
        } catch (error) {
            const { message } = formatErrorForLogging(error)

            this.logger.error(
                `[generateTextWithTools] Failed to generate text: ${message}`
            )
            return err(new AIError("Failed to generate text using OpenAI"))
        }
    }
}
