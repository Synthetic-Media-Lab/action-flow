import { NotFoundError } from "src/error/not-found.error"
import { AiBrandAnalysisError } from "./ai-brand-analysis.error"

export type AiAnalysisAsyncError = AiBrandAnalysisError | NotFoundError
