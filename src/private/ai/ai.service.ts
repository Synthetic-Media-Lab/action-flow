import { Inject, Injectable, Logger } from "@nestjs/common"
import { Err, Ok, Result } from "pratica"
import { AIFunctionCallService } from "../ai-function-call/ai-function-call.service"
import { AIError } from "./error/ai.error"
import { AICustomOptions, AIGenericResponse, IAI } from "./interface/IAI"
import { AI_MODEL_TOKEN } from "./providers/openai/openai.model.provider"

@Injectable()
export class AIService<T = unknown, TArgs = unknown> implements IAI<T, TArgs> {
    private readonly logger = new Logger(AIService.name)

    constructor(
        @Inject(AI_MODEL_TOKEN) private readonly provider: IAI<T, TArgs>,
        private readonly aiFunctionCallService: AIFunctionCallService
    ) {}

    public async generateText(
        prompt: string,
        options?: AICustomOptions
    ): Promise<Result<AIGenericResponse<T, TArgs>, AIError>> {
        try {
            const result = await this.provider.generateText(prompt, options)

            this.logger.debug(
                `Provider result: ${JSON.stringify(result, null, 2)}`
            )

            return result.cata({
                Ok: response => Ok(response),
                Err: error =>
                    Err(
                        new AIError(`Failed to generate text. ${error.message}`)
                    )
            })
        } catch (error) {
            this.logger.error(`Error during text generation: ${error.message}`)
            return Err(new AIError("Failed to generate text"))
        }
    }

    public async generateTextWithTools(
        prompt: string,
        options?: AICustomOptions
    ): Promise<Result<AIGenericResponse<T, TArgs>, AIError>> {
        try {
            const result = await this.provider.generateTextWithTools(
                prompt,
                options
            )

            this.logger.debug(
                `Provider result: ${JSON.stringify(result, null, 2)}`
            )

            return result.cata({
                Ok: async (response: AIGenericResponse<T, TArgs>) => {
                    const { generatedText, toolCall } = response

                    if (toolCall) {
                        this.logger.debug(
                            `Tool call detected: ${toolCall.function.name}`
                        )

                        const functionCallResult =
                            await this.aiFunctionCallService.handleFunctionCall(
                                toolCall
                            )

                        return functionCallResult.cata({
                            Ok: value => {
                                return Ok({
                                    ...response,
                                    generatedText:
                                        typeof value === "string"
                                            ? value
                                            : generatedText
                                })
                            },
                            Err: err =>
                                Err(
                                    new AIError(
                                        `Function call failed: ${err.message}`
                                    )
                                )
                        })
                    }

                    return Ok(response)
                },
                Err: (error: AIError) =>
                    Err(
                        new AIError(`Failed to generate text. ${error.message}`)
                    )
            })
        } catch (error) {
            this.logger.error(`Error during text generation: ${error.message}`)

            return Err(new AIError("Failed to generate text"))
        }
    }
}
