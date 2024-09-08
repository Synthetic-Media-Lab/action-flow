import { getWeatherHandler } from "./get-weather.handler"
import { IAIFunctionCall } from "../interface/IAIFunctionCall"

export const functionHandlers: Record<string, IAIFunctionCall<unknown>> = {
    getWeather: getWeatherHandler
}

export const functionHandlersProvider = {
    provide: "FUNCTION_HANDLERS",
    useValue: functionHandlers
}
