import { Result } from "neverthrow"
import { CreateActionADto } from "../dto/create-action-a.dto"
import { ActionAAsyncError } from "../error"
import { ActionAError } from "../error/action-a.error"

export interface IActionA
    extends IExecuteActionA,
        IExecuteAsyncActionA,
        ISimulateAsyncOperation {}

interface IExecuteActionA {
    executeActionA(action: CreateActionADto): Result<string, ActionAError>
}

interface IExecuteAsyncActionA {
    executeAsyncActionA(
        action: CreateActionADto
    ): Promise<Result<string, ActionAAsyncError>>
}

interface ISimulateAsyncOperation {
    simulateAsyncOperation(
        ms?: number
    ): Promise<Result<void, ActionAAsyncError>>
}
