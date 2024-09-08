export const getWeatherSchema = {
    name: "getWeather",
    description: "Fetches the current weather for a given location.",
    parameters: {
        type: "object",
        properties: {
            latitude: {
                type: "number",
                description: "The latitude of the location."
            },
            longitude: {
                type: "number",
                description: "The longitude of the location."
            }
        },
        required: ["latitude", "longitude"],
        additionalProperties: false
    }
}
