import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger
} from "@nestjs/common"
import { CoreAssistantMessage, CoreMessage, ToolResultPart } from "ai"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

interface AIResponse {
    messages: CoreMessage[]
}

@Injectable()
export class OpenAIMessageInterceptor implements NestInterceptor {
    private readonly logger = new Logger(OpenAIMessageInterceptor.name)
    private readonly debug = true

    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<CoreMessage[]> {
        this.logDebug("INTERCEPTING!")

        return next.handle().pipe(
            map((data: CoreMessage[]) => {
                this.logDebug("data --->", JSON.stringify(data, null, 2))

                if (Array.isArray(data)) {
                    const normalizedMessages =
                        this.normalizeOpenAIContentMessages(data)
                    this.logDebug(
                        "normalized messages --->",
                        JSON.stringify(normalizedMessages, null, 2)
                    )

                    return normalizedMessages
                }

                return data // Return the original data if not an array
            })
        )
    }

    private normalizeOpenAIContentMessages(
        messages: CoreMessage[]
    ): CoreMessage[] {
        this.logDebug("messages ---->", JSON.stringify(messages, null, 2))

        // Define a union type for possible content types
        type ContentType =
            | { type: "text"; text: string }
            | {
                  type: "tool-call"
                  toolName: string
                  args: Record<string, unknown>
              } // args as Record
            | ToolResultPart // SDK-provided type

        // Check if the message content is an array of ContentType
        return messages.map(message => {
            this.logDebug("message ---->", JSON.stringify(message, null, 2))

            if (Array.isArray(message.content)) {
                const flattenedContent = message.content
                    .map(c => {
                        if (c.type === "tool-call") {
                            return `Calling tool ${c.toolName} with args: ${JSON.stringify(c.args)}`
                        }
                        if (c.type === "tool-result") {
                            return `Tool result from ${c.toolName}: ${JSON.stringify(c.result)}`
                        }
                        if (c.type === "text") {
                            return c.text
                        }
                        return ""
                    })
                    .join(" ") // Join all the parts into one string

                // Replace the content with the flattened string
                return {
                    ...message,
                    content: flattenedContent
                } as CoreAssistantMessage // Assuming it's an assistant message
            }

            // If content is not an array, return the message unchanged
            return message
        })
    }

    private logDebug(message: string, ...args: unknown[]): void {
        if (this.debug) {
            this.logger.debug(message)
        }
    }
}
