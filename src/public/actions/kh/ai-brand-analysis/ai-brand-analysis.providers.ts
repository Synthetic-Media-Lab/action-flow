import { AiBrandAnalysisService } from "./ai-brand-analysis.service"

export const AI_ANALYSIS_SERVICE_TOKEN = "AI_ANALYSIS_SERVICE_TOKEN"

export const aiAnalysisServiceProvider = {
    provide: AI_ANALYSIS_SERVICE_TOKEN,
    useClass: AiBrandAnalysisService
}
