import { Module } from "@nestjs/common"
import { ActionAController } from "./action-a.controller"
import { actionAServiceProvider } from "./action-a.providers"

@Module({
    imports: [],
    controllers: [ActionAController],
    providers: [actionAServiceProvider],
    exports: [actionAServiceProvider]
})
export class ActionAModule {}
