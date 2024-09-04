export class BaseError extends Error {
    readonly type: string

    constructor(message: string) {
        super(message)
        this.name = this.constructor.name

        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}
