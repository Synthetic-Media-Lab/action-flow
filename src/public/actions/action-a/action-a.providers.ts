import { ActionAService } from "./action-a.service"

export const ACTION_A_SERVICE_TOKEN = "ACTION_A_SERVICE_TOKEN"

export const actionAServiceProvider = {
    provide: ACTION_A_SERVICE_TOKEN,
    useClass: ActionAService
}
