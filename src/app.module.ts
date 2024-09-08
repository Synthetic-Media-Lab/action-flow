import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import appConfig from "./app-config"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { GoogleSheetModule } from "./private/google-sheet/google-sheet.module"
import { ActionAModule } from "./public/actions/action-a/action-a.module"
import { AIModule } from "./private/ai/ai.module"
import { AIFunctionCallModule } from "./private/ai-function-call/ai-function-call.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        ActionAModule,
        AIModule,
        AIFunctionCallModule,
        GoogleSheetModule
    ],
    controllers: [AppController],
    providers: [AppService, ...appConfig],
    exports: [ConfigModule]
})
export class AppModule {}
