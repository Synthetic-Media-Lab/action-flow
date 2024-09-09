import { CoreTool } from "ai"
import { z } from "zod"
import { AIError } from "src/private/ai/error/ai.error"
import { Logger } from "@nestjs/common"

const getWeatherSchema = z.object({
    latitude: z.number().describe("The latitude of the location."),
    longitude: z.number().describe("The longitude of the location.")
})

type GetWeatherArgs = z.infer<typeof getWeatherSchema>

export const getWeatherTool: CoreTool<typeof getWeatherSchema, string> = {
    description: "Fetches the current weather for a given location.",
    parameters: getWeatherSchema,
    async execute({ latitude, longitude }: GetWeatherArgs): Promise<string> {
        const logger = new Logger("getWeatherTool")

        logger.debug(
            `Calling getWeatherTool -> latitude: ${latitude}, longitude: ${longitude}`
        )
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
            )

            if (!response.ok) {
                throw new Error("Failed to fetch weather data")
            }

            const weatherData = await response.json()
            const currentWeather = weatherData.current_weather

            return JSON.stringify({
                latitude,
                longitude,
                temperature: currentWeather.temperature,
                weatherCode: currentWeather.weathercode
            })
        } catch (error) {
            throw new AIError("Error retrieving weather data")
        }
    }
}
