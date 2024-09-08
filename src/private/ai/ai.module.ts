import { forwardRef, Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { AIFunctionCallModule } from "../ai-function-call/ai-function-call.module"
import { AIController } from "./ai.controller"
import { AI_SERVICE_TOKEN, aIServiceProvider } from "./ai.provider"
import {
    AI_MODEL_TOKEN,
    openAIModelProvider
} from "./providers/openai/openai.model.provider"

@Module({
    imports: [ConfigModule, forwardRef(() => AIFunctionCallModule)],
    controllers: [AIController],
    providers: [aIServiceProvider, openAIModelProvider],
    exports: [AI_SERVICE_TOKEN, AI_MODEL_TOKEN]
})
export class AIModule {}
