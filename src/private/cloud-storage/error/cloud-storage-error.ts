import { FetchError } from "src/error/fetch.error"

export class GoogleSheetAPIError extends FetchError {
    readonly type = "google-sheet-api-error"

    constructor(message: string, statusCode: number) {
        super(message, statusCode)
        this.name = "GoogleSheetAPIError"
    }
}
