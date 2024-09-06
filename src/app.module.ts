import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { ConfigModule } from "@nestjs/config"
import { resolve } from "path"
import appConfig from "./app-config"
import { ActionAModule } from "./public/actions/action-a/action-a.module"
import { GoogleSheetModule } from "./private/google-sheet/google-sheet.module"

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath:
                process.env.NODE_ENV === "test"
                    ? resolve(__dirname, "../.env.test")
                    : resolve(__dirname, "../.env")
        }),
        ActionAModule,
        GoogleSheetModule
    ],
    controllers: [AppController],
    providers: [AppService, ...appConfig],
    exports: [ConfigModule]
})
export class AppModule {}
