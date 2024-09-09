import { getWeatherTool } from "src/private/gen-ai/functions/function-handlers/get-weather.handler"
import { CoreTool } from "ai"

export const functionHandlers: Record<string, CoreTool> = {
    getWeather: getWeatherTool
}

export const functionHandlersProvider = {
    provide: "FUNCTION_HANDLERS",
    useValue: functionHandlers
}

export type FunctionTools = typeof functionHandlers
