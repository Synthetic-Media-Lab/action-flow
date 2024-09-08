import { IAIFunctionCall } from "../interface/IAIFunctionCall"
import { Result, Ok, Err } from "pratica"
import { AIError } from "src/private/ai/error/ai.error"

interface GetWeatherArgs {
    latitude: number
    longitude: number
}

export const getWeatherHandler: IAIFunctionCall<GetWeatherArgs> = {
    async handleFunction(
        args: GetWeatherArgs
    ): Promise<Result<string, AIError>> {
        const { latitude, longitude } = args

        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            )

            if (!response.ok) {
                return Err(new AIError("Failed to fetch weather data"))
            }

            const weatherData = await response.json()
            const currentWeather = weatherData.current_weather

            return Ok(
                `The current temperature at latitude ${latitude}, longitude ${longitude} is ${currentWeather.temperature}°C with ${currentWeather.weathercode}.`
            )
        } catch (error) {
            return Err(new AIError("Error retrieving weather data"))
        }
    }
}
