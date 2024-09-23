import { GenAIOpenAIService } from "./providers/openai/gen-ai-openai.service"

export const GEN_AI_SERVICE_TOKEN = "AI_SERVICE_TOKEN"

export const aIServiceProvider = {
    provide: GEN_AI_SERVICE_TOKEN,
    useClass: GenAIOpenAIService
}
