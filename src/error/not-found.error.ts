import { BaseError } from "./base.error"

export class NotFoundError extends BaseError {
    readonly type = "not-found"

    constructor(message: string) {
        super(message)
    }
}
