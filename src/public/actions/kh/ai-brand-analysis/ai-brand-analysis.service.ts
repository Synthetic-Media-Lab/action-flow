import { Inject, Injectable, Logger } from "@nestjs/common"
import { err, ok, Result } from "neverthrow"
import { GEN_AI_SERVICE_TOKEN } from "src/private/gen-ai/gen-ai.provider"
import { IGenAI } from "src/private/gen-ai/interface/gen-ai.interface"
import { AiBrandAnalysisDto } from "./dto/ai-brand-analysis.dto"
import { AiBrandAnalysisError } from "./error/ai-brand-analysis.error"
import { IAiAnalysisService } from "./interfaces/IAiAnalysis"
import { brandAnalysisSchema } from "./schema/brand-analysis-schema"
import { AiAnalysisResult } from "./types/types"

@Injectable()
export class AiBrandAnalysisService implements IAiAnalysisService {
    private readonly logger = new Logger(AiBrandAnalysisService.name)

    constructor(
        @Inject(GEN_AI_SERVICE_TOKEN)
        private readonly ai: IGenAI<{}>
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

        const analysis = await this.ai.generateObject({
            prompt: `{
                brandName: ${googleSheetBrandSelection},
                euipoTrademarksResult: ${euipoTrademarksResult},
                domains: {
                    com: {
                        available: true
                    },
                    se: {
                        available: false
                    }
                }
            }`,
            schema: brandAnalysisSchema,
            temperature: 0.4,
            output: "object"
        })

        return analysis.match(
            result => ok(result),
            error => {
                this.logger.error(
                    `Error checking WIPO trademark: ${error.message}`
                )

                return err(new AiBrandAnalysisError(error.message))
            }
        )
    }
}
