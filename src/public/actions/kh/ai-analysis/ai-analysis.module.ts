import { Module } from "@nestjs/common"
import { AiAnalysisController } from "./ai-analysis.controller"
import { aiAnalysisServiceProvider } from "./ai-analysis.providers"
import { ConfigModule } from "@nestjs/config"
import { GenAIModule } from "src/private/gen-ai/gen-ai.module"

@Module({
    imports: [ConfigModule, GenAIModule],
    controllers: [AiAnalysisController],
    providers: [aiAnalysisServiceProvider],
    exports: [aiAnalysisServiceProvider]
})
export class AiAnalysisModule {}
