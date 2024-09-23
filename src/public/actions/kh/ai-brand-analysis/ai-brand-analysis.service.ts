import { Inject, Injectable, Logger } from "@nestjs/common"
import { err, ok, Result } from "neverthrow"
import { IAiAnalysisService, AiAnalysisResult } from "./interfaces/IAiAnalysis"
import { GEN_AI_SERVICE_TOKEN } from "src/private/gen-ai/gen-ai.provider"
import { IGenAI } from "src/private/gen-ai/interface/gen-ai.interface"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { AiBrandAnalysisDto } from "./dto/ai-brand-analysis.dto"
import { AiBrandAnalysisError } from "./error/ai-brand-analysis.error"

@Injectable()
export class AiBrandAnalysisService implements IAiAnalysisService {
    private readonly logger = new Logger(AiBrandAnalysisService.name)

    constructor(
        @Inject(GEN_AI_SERVICE_TOKEN)
        private readonly ai: IGenAI<{}>,
        private readonly eventEmitter: EventEmitter2
    ) {}

    public async run(
        dto: AiBrandAnalysisDto
    ): Promise<Result<AiAnalysisResult, AiBrandAnalysisError>> {
        const { euipoTrademarksResult, googleSheetBrandSelection } = dto
        this.logger.debug(
            `Analyzing brand: ${googleSheetBrandSelection} with EUIPO trademarks: ${euipoTrademarksResult}`
        )

        if (!euipoTrademarksResult || !googleSheetBrandSelection) {
            return err(
                new AiBrandAnalysisError(
                    `No EUIPO trademarks or brand provided`
                )
            )
        }

        const analysis = await this.ai.generateText([
            {
                role: "user",
                content: `
                Analyze the following data:
          
                {
                  "brandName": "${googleSheetBrandSelection}",
                  "trademarks": ${JSON.stringify(euipoTrademarksResult)},
                  "domains": {
                    "com": {
                      "available": true
                    },
                    "se": {
                      "available": true
                    }
                  }
                }
              `
            }
        ])

        return analysis.match(
            result => {
                const analysisResult = { text: result.text }

                return ok(analysisResult)
            },
            error => {
                this.logger.error(
                    `Error checking WIPO trademark: ${error.message}`
                )

                return err(new AiBrandAnalysisError(error.message))
            }
        )
    }
}
