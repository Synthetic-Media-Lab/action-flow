import { CreateActionADto } from "../dto/create-action-a.dto"

export interface IActionA extends IExecuteActionA {}

interface IExecuteActionA {
    executeActionA(action: CreateActionADto): Promise<string>
}
