import { Result } from "pratica"
import { CreateActionADto } from "../dto/create-action-a.dto"
import { ActionAAsyncError } from "../error"
import { ActionAError } from "../error/action-a.error"

export interface IActionA extends IExecuteActionA, IExecuteAsyncActionA {}

interface IExecuteActionA {
    executeActionA(action: CreateActionADto): Result<string, ActionAError>
}

interface IExecuteAsyncActionA {
    executeAsyncActionA(
        action: CreateActionADto
    ): Promise<Result<string, ActionAAsyncError>>
}
