import { Result } from "neverthrow"
import { AiBrandAnalysisError } from "../error/ai-brand-analysis.error"
import { AiBrandAnalysisDto } from "../dto/ai-brand-analysis.dto"

export interface IAiAnalysisService {
    run(
        dto: AiBrandAnalysisDto
    ): Promise<Result<AiAnalysisResult, AiBrandAnalysisError>>
}

export interface AiAnalysisResult {
    text: string
}
