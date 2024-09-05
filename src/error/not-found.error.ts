export class NotFoundError extends Error {
    readonly type = "not-found"

    constructor(message: string) {
        super(message)
    }
}
