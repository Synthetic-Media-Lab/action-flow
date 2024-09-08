import { Module } from "@nestjs/common"
import { AIFunctionCallService } from "./ai-function-call.service"
import { functionHandlersProvider } from "./function-handlers"

@Module({
    providers: [AIFunctionCallService, functionHandlersProvider],
    exports: [AIFunctionCallService]
})
export class AIFunctionCallModule {}
