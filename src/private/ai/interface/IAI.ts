import { Result } from "pratica"
import { AIError } from "../error/ai.error"

export interface IAI {
    generateText(prompt: string): Promise<Result<string, AIError>>
}
