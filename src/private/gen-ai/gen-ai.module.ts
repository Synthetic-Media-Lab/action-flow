import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { OpenAIController } from "./gen-ai.controller"
import { aIServiceProvider, GEN_AI_SERVICE_TOKEN } from "./gen-ai.provider"
import { functionHandlersProvider } from "./functions/function-handlers"

@Module({
    imports: [ConfigModule],
    controllers: [OpenAIController],
    providers: [aIServiceProvider, functionHandlersProvider],
    exports: [GEN_AI_SERVICE_TOKEN]
})
export class GenAIModule {}
