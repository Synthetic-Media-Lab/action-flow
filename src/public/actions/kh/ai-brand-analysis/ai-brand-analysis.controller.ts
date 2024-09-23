import {
    Controller,
    Post,
    HttpException,
    HttpStatus,
    Inject,
    Body,
    UsePipes,
    ValidationPipe,
    Logger,
    UseInterceptors,
    UseGuards
} from "@nestjs/common"
import { AI_ANALYSIS_SERVICE_TOKEN } from "./ai-brand-analysis.providers"
import { IAiAnalysisService, AiAnalysisResult } from "./interfaces/IAiAnalysis"
import { LoggingInterceptor } from "src/shared/interceptors/logging-interceptor"
import { AiBrandAnalysisDto } from "./dto/ai-brand-analysis.dto"
import { identity } from "rxjs"
import { IEuipoTrademark } from "../trademark/interface/IEuipoTrademarksResult"
import { EnforceServerSystemMessageGuard } from "src/private/gen-ai/guards/enforce-server-system-message.guard"
import { SystemMessage } from "src/private/gen-ai/decorators/system-message.decorator"
import { DOMAIN_AND_BRAND_ANALYSIS_SYSTEM_PROMPT } from "./system-prompts/domain-and-brand-analysis"

@Controller("ai-brand-analysis")
@UseInterceptors(LoggingInterceptor)
export class AiBrandAnalysisController {
    private readonly logger = new Logger(AiBrandAnalysisController.name)

    constructor(
        @Inject(AI_ANALYSIS_SERVICE_TOKEN)
        private readonly aiAnalysisService: IAiAnalysisService
    ) {}

    @Post("run")
    @UseGuards(EnforceServerSystemMessageGuard)
    @SystemMessage(DOMAIN_AND_BRAND_ANALYSIS_SYSTEM_PROMPT)
    @UsePipes(new ValidationPipe({ transform: true }))
    async analyze(
        @Body()
        dto: AiBrandAnalysisDto<IEuipoTrademark>
    ): Promise<AiAnalysisResult> {
        this.logger.debug(`Received text for analysis: ${JSON.stringify(dto)}`)

        const result = await this.aiAnalysisService.run(dto)

        return result.match(identity, error => {
            this.logger.error(`Error in AI analysis: ${error.message}`)

            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: error.message
                },
                HttpStatus.BAD_REQUEST
            )
        })
    }
}
