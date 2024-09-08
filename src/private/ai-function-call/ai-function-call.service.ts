import { Injectable, Logger } from "@nestjs/common"
import { Err, Just, Maybe, Nothing, Ok, Result } from "pratica"
import { AIError } from "../ai/error/ai.error"
import { functionHandlers } from "./function-handlers"
import { AIGenericResponse, ToolCall } from "../ai/interface/IAI"

@Injectable()
export class AIFunctionCallService {
    private readonly logger = new Logger(AIFunctionCallService.name)

    /**
     * Handles the function call from AI response using the appropriate handler.
     * @param toolCall - The tool call extracted from AI response.
     * @returns Result containing either the structured response or an AIError.
     */
    public async handleFunctionCall<TArgs>(
        toolCall: ToolCall<TArgs>
    ): Promise<Result<AIGenericResponse<string, TArgs>, AIError>> {
        try {
            const handler = functionHandlers[toolCall?.function?.name]

            this.logger.debug(
                `Looking up handler for function: ${toolCall?.function?.name}`
            )

            if (!handler) {
                this.logger.error(
                    `No handler found for function: ${toolCall?.function?.name}`
                )
                return Err(
                    new AIError(
                        `No handler found for ${toolCall?.function?.name}`
                    )
                )
            }

            this.logger.debug(
                `Handling function call with arguments: ${JSON.stringify(toolCall.function.arguments)}`
            )

            const handlerResult = await handler.handleFunction(
                toolCall.function.arguments
            )

            return handlerResult.cata({
                Ok: (result: string) => {
                    this.logger.debug(
                        `Function call successful with result: ${result}`
                    )
                    return Ok({
                        rawResponse: result,
                        generatedText: result,
                        toolCall: toolCall
                    })
                },
                Err: (error: AIError) => {
                    this.logger.error(`Function call failed: ${error.message}`)
                    return Err(new AIError("Function call execution failed"))
                }
            })
        } catch (error) {
            this.logger.error(`Error handling function call: ${error.message}`)
            return Err(new AIError("Failed to handle function call"))
        }
    }

    /**
     * Attempts to parse a tool call from the AI response if available.
     * The response is expected to be a JSON string. If it's plain text or
     * does not contain a valid tool call, the method will return Nothing
     * without logging an error.
     *
     * @param response - The AI-generated response in string format.
     * @returns Maybe type containing the ToolCall or Nothing if no tool call is found.
     */
    public parseToolCall<TArgs>(response: string): Maybe<ToolCall<TArgs>> {
        try {
            this.logger.debug(`Parsing tool call from response: ${response}`)

            const parsedResponse = JSON.parse(response)

            const toolCall = parsedResponse?.tool_calls?.[0]

            if (toolCall) {
                this.logger.debug(
                    `Tool call found: ${JSON.stringify(toolCall)}`
                )
                return Just(toolCall)
            } else {
                this.logger.debug(`No tool call found in response.`)
                return Nothing
            }
        } catch (error) {
            this.logger.debug(
                `No valid tool call detected, likely a plain text response.`
            )

            return Nothing
        }
    }
}
