export class FetchError extends Error {
    readonly type: string = "fetch-error"
    readonly statusCode?: number
    readonly responseBody?: unknown

    constructor(message: string, statusCode?: number, responseBody?: unknown) {
        super(message)
        this.name = "FetchError"
        this.statusCode = statusCode
        this.responseBody = responseBody
    }
}
