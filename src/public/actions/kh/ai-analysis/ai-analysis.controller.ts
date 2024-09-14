import {
    Controller,
    Post,
    HttpException,
    HttpStatus,
    Inject,
    Body,
    UsePipes,
    ValidationPipe,
    Logger
} from "@nestjs/common"
import { AI_ANALYSIS_SERVICE_TOKEN } from "./ai-analysis.providers"
import { AiAnalysisDto } from "./dto/ai-analysis.dto"
import { IAiAnalysisService, AiAnalysisResult } from "./interfaces/IAiAnalysis"

@Controller("ai-analysis")
export class AiAnalysisController {
    private readonly logger = new Logger(AiAnalysisController.name)

    constructor(
        @Inject(AI_ANALYSIS_SERVICE_TOKEN)
        private readonly aiAnalysisService: IAiAnalysisService
    ) {}

    @Post("run")
    @UsePipes(new ValidationPipe({ transform: true }))
    async analyze(
        @Body() aiAnalysisDto: AiAnalysisDto
    ): Promise<AiAnalysisResult> {
        const { text } = aiAnalysisDto

        this.logger.debug(`Received text for analysis: ${text}`)

        const result = await this.aiAnalysisService.run(aiAnalysisDto)

        return result.cata({
            Ok: res => res,
            Err: error => {
                this.logger.error(`Error in AI analysis: ${error.message}`)

                throw new HttpException(
                    {
                        status: HttpStatus.BAD_REQUEST,
                        error: error.message
                    },
                    HttpStatus.BAD_REQUEST
                )
            }
        })
    }
}
