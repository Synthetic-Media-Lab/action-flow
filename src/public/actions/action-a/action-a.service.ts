import { Injectable, Logger } from "@nestjs/common"
import { CreateActionADto } from "./dto/create-action-a.dto"
import { ActionAAsyncError } from "./error"
import { ActionAError } from "./error/action-a.error"
import { IActionA } from "./interfaces/IActionA"
import { NotFoundError } from "src/error/not-found.error"
import { Err, Ok, Result } from "pratica"

@Injectable()
export class ActionAService implements IActionA {
    private readonly logger = new Logger(ActionAService.name)

    constructor() {}

    // public executeActionA({
    //     actionId,
    //     description
    // }: CreateActionADto): Result<string, ActionAError> {
    //     this.logger.log(`Executing action for task ID: ${actionId}`)

    //     if (!actionId) {
    //         return Result.error(new ActionAError("Invalid action ID"))
    //     }

    //     return Result.ok(
    //         `Action A executed with action ID: ${actionId}
    //         ${description ? `Optional description: "${description}"` : ""}`
    //     )
    // }

    // public async executeAsyncActionA({
    //     actionId,
    //     description
    // }: CreateActionADto): Promise<Result<string, ActionAAsyncError>> {
    //     this.logger.log(`Starting async action for task ID: ${actionId}`)

    //     const asyncResult = await this.simulateAsyncOperation()

    //     return asyncResult.map(() => {
    //         return `Async action completed for action ID: ${actionId}
    //         ${description ? `Optional description: "${description}"` : ""}`
    //     })
    // }

    public executeActionA({
        actionId,
        description
    }: CreateActionADto): Result<string, ActionAError> {
        this.logger.log(`Executing action for task ID: ${actionId}`)

        if (!actionId) {
            return Err(new ActionAError("Invalid action ID")) // Use Pratica's Err
        }

        return Ok(
            `Action A executed with action ID: ${actionId} ${description ? `Optional description: "${description}"` : ""}`
        )
    }

    public async executeAsyncActionA({
        actionId,
        description
    }: CreateActionADto): Promise<Result<string, ActionAAsyncError>> {
        this.logger.log(`Starting async action for task ID: ${actionId}`)

        const asyncResult = await this.simulateAsyncOperation()

        return asyncResult.map(() => {
            return `Async action completed for action ID: ${actionId} ${description ? `Optional description: "${description}"` : ""}`
        })
    }

    private async simulateAsyncOperation(
        ms: number = 500
    ): Promise<Result<void, ActionAAsyncError>> {
        return new Promise(resolve =>
            setTimeout(
                () =>
                    resolve(
                        Math.random() > 0.5
                            ? Ok(undefined)
                            : Math.random() > 0.5
                              ? Err(new ActionAError("Simulated async failure"))
                              : Err(
                                    new NotFoundError(
                                        "Simulated async not found"
                                    )
                                )
                    ),
                ms
            )
        )
    }
}
