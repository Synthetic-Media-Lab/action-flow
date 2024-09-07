import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { AIController } from "./ai.controller"
import { AIServiceProvider } from "./ai.providers"

@Module({
    imports: [ConfigModule],
    controllers: [AIController],
    providers: [AIServiceProvider],
    exports: [AIServiceProvider]
})
export class AIModule {}
