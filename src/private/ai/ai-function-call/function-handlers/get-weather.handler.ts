import { IAIFunctionCall } from "../interface/IAIFunctionCall"
import { Result, ok, err } from "neverthrow"
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
                return err(new AIError("Failed to fetch weather data"))
            }

            const weatherData = await response.json()
            const currentWeather = weatherData.current_weather

            return ok(
                JSON.stringify({
                    latitude,
                    longitude,
                    temperature: currentWeather.temperature,
                    weatherCode: currentWeather.weathercode
                })
            )
        } catch (error) {
            return err(new AIError("Error retrieving weather data"))
        }
    }
}
