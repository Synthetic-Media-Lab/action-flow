import { FetchError } from "./fetch.error"

export class InvalidInputError extends FetchError {
    readonly type = "invalid-input"

    constructor(message: string) {
        super(message, 422) // 422 Unprocessable Entity
        this.name = "InvalidInputError"
    }
}
