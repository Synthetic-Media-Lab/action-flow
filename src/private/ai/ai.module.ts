import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { AIController } from "./ai.controller"
import { AI_SERVICE_TOKEN, aIServiceProvider } from "./ai.provider"
import { OpenAIFunctionCallService } from "./providers/openai/openai-function-call.service"

@Module({
    imports: [ConfigModule],
    controllers: [AIController],
    providers: [aIServiceProvider, OpenAIFunctionCallService],
    exports: [AI_SERVICE_TOKEN]
})
export class AIModule {}
