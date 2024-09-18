export class ValidationError extends Error {
    readonly type = "validation"

    constructor(message: string) {
        super(message)
        this.name = "ValidationError"
    }
}
