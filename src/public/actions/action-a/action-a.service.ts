import { Injectable, Logger } from "@nestjs/common"
import { Result } from "typescript-result"
import { CreateActionADto } from "./dto/create-action-a.dto"
import { ActionAError } from "./error/action-a.error"
import { IActionA } from "./interfaces/IActionA"

@Injectable()
export class ActionAService implements IActionA {
    private readonly logger = new Logger(ActionAService.name)

    constructor() {}

    public executeActionA({
        actionId,
        description
    }: CreateActionADto): Result<string, ActionAError> {
        this.logger.log(`Executing action for task ID: ${actionId}`)

        if (!actionId) {
            return Result.error(new ActionAError("Invalid action ID"))
        }

        return Result.ok(
            `Action A executed with action ID: ${actionId} 
            ${description ? `Optional description: "${description}"` : ""}`
        )
    }

    public async executeAsyncActionA({
        actionId,
        description
    }: CreateActionADto): Promise<Result<string, ActionAError>> {
        this.logger.log(`Starting async action for task ID: ${actionId}`)

        const asyncResult = await this.simulateAsyncOperation()

        return asyncResult.map(() => {
            return `Async action completed for action ID: ${actionId} 
            ${description ? `Optional description: "${description}"` : ""}`
        })
    }

    private async simulateAsyncOperation(
        ms: number = 500
    ): Promise<Result<void, ActionAError>> {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve(
                        Math.random() > 0.5
                            ? Result.ok()
                            : Result.error(
                                  new ActionAError("Simulated async failure")
                              )
                    ),
                ms
            )
        )
    }
}
