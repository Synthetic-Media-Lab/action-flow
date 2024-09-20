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
    UseInterceptors
} from "@nestjs/common"
import { AI_ANALYSIS_SERVICE_TOKEN } from "./ai-brand-analysis.providers"
import { IAiAnalysisService, AiAnalysisResult } from "./interfaces/IAiAnalysis"
import { LoggingInterceptor } from "src/shared/interceptors/logging-interceptor"
import { AiBrandAnalysisDto } from "./dto/ai-brand-analysis.dto"

@Controller("ai-analysis")
@UseInterceptors(LoggingInterceptor)
export class AiBrandAnalysisController {
    private readonly logger = new Logger(AiBrandAnalysisController.name)

    constructor(
        @Inject(AI_ANALYSIS_SERVICE_TOKEN)
        private readonly aiAnalysisService: IAiAnalysisService
    ) {}

    @Post("run")
    @UsePipes(new ValidationPipe({ transform: true }))
    async analyze(
        @Body() aiAnalysisDto: AiBrandAnalysisDto
    ): Promise<AiAnalysisResult> {
        const { text } = aiAnalysisDto

        this.logger.debug(`Received text for analysis: ${text}`)

        const result = await this.aiAnalysisService.run(aiAnalysisDto)

        return result.match(
            res => res,
            error => {
                this.logger.error(`Error in AI analysis: ${error.message}`)

                throw new HttpException(
                    {
                        status: HttpStatus.BAD_REQUEST,
                        error: error.message
                    },
                    HttpStatus.BAD_REQUEST
                )
            }
        )
    }
}
