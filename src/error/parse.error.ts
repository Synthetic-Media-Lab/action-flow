import { FetchError } from "./fetch.error"

export class ParseError extends FetchError {
    readonly type = "parse"

    constructor(message: string) {
        super(message, 422) // 422 Unprocessable Entity
        this.name = "ParseError"
    }
}
