import { Inject, Injectable, Logger } from "@nestjs/common"
import { err, ok, Result } from "neverthrow"
import { AiAnalysisDto } from "./dto/ai-analysis.dto"
import { AiAnalysisError } from "./error/ai-analysis.error"
import { IAiAnalysisService, AiAnalysisResult } from "./interfaces/IAiAnalysis"
import { GEN_AI_SERVICE_TOKEN } from "src/private/gen-ai/gen-ai.provider"
import { IGenAI } from "src/private/gen-ai/interface/gen-ai.interface"

@Injectable()
export class AiAnalysisService implements IAiAnalysisService {
    private readonly logger = new Logger(AiAnalysisService.name)

    constructor(
        @Inject(GEN_AI_SERVICE_TOKEN)
        private readonly ai: IGenAI<{}>
    ) {}

    public async run(
        dto: AiAnalysisDto
    ): Promise<Result<AiAnalysisResult, AiAnalysisError>> {
        const { text } = dto
        this.logger.debug(`Analyzing text: ${text}`)

        if (!text) {
            return err(new AiAnalysisError("Text is required for analysis"))
        }

        const analysis = await this.ai.generateText([
            {
                role: "user",
                content: `Analyze the sentiment of the text: ${text}`
            }
        ])

        return analysis.match(
            result => ok({ text: result.text }),
            error => {
                this.logger.error(
                    `Error checking WIPO trademark: ${error.message}`
                )

                return err(new AiAnalysisError(error.message))
            }
        )
    }
}
