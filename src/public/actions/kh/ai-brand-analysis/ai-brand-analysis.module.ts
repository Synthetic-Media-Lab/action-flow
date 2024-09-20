import { Module } from "@nestjs/common"
import { aiAnalysisServiceProvider } from "./ai-brand-analysis.providers"
import { ConfigModule } from "@nestjs/config"
import { GenAIModule } from "src/private/gen-ai/gen-ai.module"
import { AiBrandAnalysisController } from "./ai-brand-analysis.controller"

@Module({
    imports: [ConfigModule, GenAIModule],
    controllers: [AiBrandAnalysisController],
    providers: [aiAnalysisServiceProvider],
    exports: [aiAnalysisServiceProvider]
})
export class AiBrandAnalysisModule {}
