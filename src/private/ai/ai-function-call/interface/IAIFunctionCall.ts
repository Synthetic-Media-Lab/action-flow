import { Result } from "neverthrow"
import { AIError } from "src/private/ai/error/ai.error"

export interface IAIFunctionCall<TArgs> {
    handleFunction(args: TArgs): Promise<Result<string, AIError>>
}
