import { BaseError } from "src/error/base.error"

export class ActionAError extends BaseError {
    readonly type = "action-a"

    constructor(message: string) {
        super(message)
        this.name = "ActionAError"
    }
}
