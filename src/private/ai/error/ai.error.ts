export class AIError extends Error {
    readonly type = "ai-error"

    constructor(message: string) {
        super(message)
        this.name = "AIError"
    }
}
