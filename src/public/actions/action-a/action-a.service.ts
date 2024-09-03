import { Injectable, Logger } from "@nestjs/common"
import { IActionA } from "./interfaces/IActionA"

@Injectable()
export class ActionAService implements IActionA {
    private readonly logger = new Logger(ActionAService.name)

    constructor() {}

    async executeActionA({ actionId, description }): Promise<string> {
        this.logger.log(`Executing action for task ID: ${actionId}`)

        // Business logic for Action-A

        return `Action A executed with action ID: ${actionId} 
        ${description ? `Optional description: "${description}"` : ""}`
    }
}
