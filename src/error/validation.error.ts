import { BaseError } from "./base.error"

export class ValidationError extends BaseError {
    readonly type = "validation"

    constructor(message: string) {
        super(message)
    }
}
