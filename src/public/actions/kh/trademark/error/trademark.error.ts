export class TrademarkError extends Error {
    readonly type = "trademark"

    constructor(message: string) {
        super(message)
        this.name = "TrademarkError"
    }
}
