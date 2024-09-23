import { Result } from "neverthrow"
import { AiBrandAnalysisError } from "../error/ai-brand-analysis.error"
import { AiBrandAnalysisDto } from "../dto/ai-brand-analysis.dto"
import { AiAnalysisResult } from "../types/types"

export interface IAiAnalysisService {
    run(
        dto: AiBrandAnalysisDto
    ): Promise<Result<AiAnalysisResult, AiBrandAnalysisError>>
}
