import { NotFoundError } from "src/error/not-found.error"
import { AiAnalysisError } from "./ai-analysis.error"

export type AiAnalysisAsyncError = AiAnalysisError | NotFoundError
