import { OpenAIService } from "./openai.service"

export const AI_MODEL_TOKEN = "AI_MODEL_TOKEN"

export const openAIModelProvider = {
    provide: AI_MODEL_TOKEN,
    useClass: OpenAIService
}
