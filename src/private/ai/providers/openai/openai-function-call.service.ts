import { Injectable, Logger } from "@nestjs/common"
import OpenAI from "openai"
import { Just, Maybe, Nothing } from "pratica"
import { Result, err, ok } from "neverthrow"
import { functionHandlers } from "../../ai-function-call/function-handlers"
import { AIError } from "../../error/ai.error"
import { AIGenericResponse, ToolCall } from "../../interface/IAI"

@Injectable()
export class OpenAIFunctionCallService {
    private readonly logger = new Logger(OpenAIFunctionCallService.name)

    /**
     * Handles the function call from AI response using the appropriate handler.
     * @param toolCall - The tool call extracted from AI response.
     * @returns Result containing either the structured response or an AIError.
     */
    public async handleFunctionCall(
        toolCall: ToolCall<unknown>
    ): Promise<
        Result<
            AIGenericResponse<OpenAI.Chat.Completions.ChatCompletion, unknown>,
            AIError
        >
    > {
        try {
            const handler = functionHandlers[toolCall.function.name]
            this.logger.debug(
                `Looking up handler for function: ${toolCall.function.name}`
            )

            if (!handler) {
                this.logger.error(
                    `No handler found for function: ${toolCall.function.name}`
                )
                return err(
                    new AIError(
                        `No handler found for ${toolCall.function.name}`
                    )
                )
            }

            this.logger.debug(
                `Handling function call with arguments: ${JSON.stringify(toolCall.function.arguments)}`
            )

            const handlerResult = await handler.handleFunction(
                toolCall.function.arguments
            )

            return handlerResult.match(
                (result: string) => {
                    this.logger.debug(
                        `Function call successful with result: ${result}`
                    )
                    return ok({
                        rawResponse: {
                            choices: [{ message: { content: result } }]
                        } as OpenAI.Chat.Completions.ChatCompletion,
                        generatedText: result,
                        toolCall: toolCall
                    })
                },
                (error: AIError) => {
                    this.logger.error(`Function call failed: ${error.message}`)
                    return err(new AIError("Function call execution failed"))
                }
            )
        } catch (error) {
            this.logger.error(`Error handling function call: ${error.message}`)
            return err(new AIError("Failed to handle function call"))
        }
    }

    /**
     * Parses tool call from the AI-generated response.
     * @param response - The AI-generated response.
     * @returns Maybe type containing the ToolCall or Nothing if no tool call is found.
     */
    public parseToolCall(
        response: OpenAI.Chat.Completions.ChatCompletion
    ): Maybe<ToolCall<unknown>> {
        try {
            this.logger.debug(
                `Parsing tool call from response: ${JSON.stringify(response, null, 2)}`
            )

            const functionCall = response?.choices?.[0]?.message?.function_call

            if (functionCall) {
                return Just({
                    function: {
                        name: functionCall.name,
                        arguments: JSON.parse(functionCall.arguments)
                    }
                })
            } else {
                this.logger.debug(`No function call found in response.`)
                return Nothing
            }
        } catch (error) {
            this.logger.error(`Error parsing function call: ${error.message}`)
            return Nothing
        }
    }
}
