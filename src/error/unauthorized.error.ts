import { FetchError } from "./fetch.error"

export class UnauthorizedError extends FetchError {
    readonly type = "unauthorized"

    constructor(message: string) {
        super(message, 401)
        this.name = "UnauthorizedError"
    }
}
