import { OpenAIService } from "./providers/openai/openai.service"

export const AI_SERVICE_TOKEN = "AI_SERVICE_TOKEN"

export const aIServiceProvider = {
    provide: AI_SERVICE_TOKEN,
    useClass: OpenAIService
}
