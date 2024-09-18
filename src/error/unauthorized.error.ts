export class UnauthorizedError extends Error {
    readonly statusCode = 401
    readonly type = "unauthorized"

    constructor(message: string) {
        super(message)
    }
}
