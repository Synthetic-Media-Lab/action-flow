import { AIService } from "./ai.service"

export const AI_SERVICE_TOKEN = "AI_SERVICE_TOKEN"

export const aIServiceProvider = {
    provide: AI_SERVICE_TOKEN,
    useClass: AIService
}
