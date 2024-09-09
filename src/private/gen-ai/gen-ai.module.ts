import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { AIController as GenAIController } from "./gen-ai.controller"
import { aIServiceProvider, GEN_AI_SERVICE_TOKEN } from "./gen-ai.provider"
import { functionHandlersProvider } from "./functions/function-handlers"

@Module({
    imports: [ConfigModule],
    controllers: [GenAIController],
    providers: [aIServiceProvider, functionHandlersProvider],
    exports: [GEN_AI_SERVICE_TOKEN]
})
export class GenAIModule {}
