import { GenAIService } from "./gen-ai.service"

export const GEN_AI_SERVICE_TOKEN = "AI_SERVICE_TOKEN"

export const aIServiceProvider = {
    provide: GEN_AI_SERVICE_TOKEN,
    useClass: GenAIService
}
