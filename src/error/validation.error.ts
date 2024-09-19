import { FetchError } from "./fetch.error"

export class ValidationError extends FetchError {
    readonly type = "validation"

    constructor(message: string) {
        super(message, 400) // 400 Bad Request
        this.name = "ValidationError"
    }
}
