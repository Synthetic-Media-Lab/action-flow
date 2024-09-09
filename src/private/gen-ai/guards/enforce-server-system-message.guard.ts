import {
    CanActivate,
    ExecutionContext,
    Injectable,
    HttpException
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { Request } from "express"

@Injectable()
export class EnforceServerSystemMessageGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const request: Request = context.switchToHttp().getRequest()
        const systemMessage = this.getSystemMessageFromMetadata(context)

        const messages = request.body.messages

        if (messages) {
            request.body.messages = this.processMessages(
                messages,
                systemMessage
            )
        }

        return true
    }

    private getSystemMessageFromMetadata(context: ExecutionContext): string {
        const systemMessage = this.reflector.get<string>(
            "systemMessage",
            context.getHandler()
        )

        if (!systemMessage) {
            throw new HttpException(
                "[EnforceServerSystemMessageGuard] System message configuration missing.",
                500
            )
        }

        return systemMessage
    }

    private processMessages(
        messages: Array<{ role: string; content: string }>,
        systemMessage: string
    ): Array<{ role: string; content: string }> {
        const hasSystemMessage = this.hasSystemMessage(messages)

        if (hasSystemMessage) {
            return this.replaceSystemMessage(messages, systemMessage)
        }

        return this.prependSystemMessage(messages, systemMessage)
    }

    private hasSystemMessage(
        messages: Array<{ role: string; content: string }>
    ): boolean {
        return messages.some(message => message.role === "system")
    }

    private replaceSystemMessage(
        messages: Array<{ role: string; content: string }>,
        systemMessage: string
    ): Array<{ role: string; content: string }> {
        return messages.map(message =>
            message.role === "system"
                ? { ...message, content: systemMessage }
                : message
        )
    }

    private prependSystemMessage(
        messages: Array<{ role: string; content: string }>,
        systemMessage: string
    ): Array<{ role: string; content: string }> {
        return [{ role: "system", content: systemMessage }, ...messages]
    }
}
