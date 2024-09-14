export class AiAnalysisError extends Error {
    readonly type = "ai-analysis"

    constructor(message: string) {
        super(message)
        this.name = "AiAnalysisError"
    }
}
