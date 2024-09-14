import { Result } from "pratica"
import { AiAnalysisDto } from "../dto/ai-analysis.dto"
import { AiAnalysisError } from "../error/ai-analysis.error"

export interface IAiAnalysisService {
    run(dto: AiAnalysisDto): Promise<Result<AiAnalysisResult, AiAnalysisError>>
}

export interface AiAnalysisResult {
    text: string
}
