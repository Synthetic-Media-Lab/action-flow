import { FetchError } from "./fetch.error"

export class NotFoundError extends FetchError {
    readonly type = "not-found"

    constructor(message: string) {
        super(message, 404)
        this.name = "NotFoundError"
    }
}
