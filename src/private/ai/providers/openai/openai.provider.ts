import { OpenAIService } from "./openai.service"

export const OPENAI_SERVICE_TOKEN = "OPENAI_SERVICE_TOKEN"

export const openAIServiceProvider = {
    provide: OPENAI_SERVICE_TOKEN,
    useClass: OpenAIService
}
