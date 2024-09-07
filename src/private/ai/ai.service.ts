import { Injectable } from "@nestjs/common"
import { Result, Ok, Err } from "pratica"
import { AIError } from "./error/ai.error"
import { IAI } from "./interface/IAI"

@Injectable()
export class AIService implements IAI {
    private readonly provider: IAI

    constructor(provider: IAI) {
        this.provider = provider
    }

    public async generateText(
        prompt: string
    ): Promise<Result<string, AIError>> {
        try {
            const result = await this.provider.generateText(prompt)

            return result.cata({
                Ok: (value: string) => Ok(value),
                Err: (error: AIError) =>
                    Err(new AIError(`Failed to generate text. ${error}`))
            })
        } catch (error) {
            return Err(new AIError("Failed to generate text"))
        }
    }
}
