# Gen AI Module

[← Back to Main Documentation](../README.md)

## Overview

The Gen AI Module leverages **Vercel's AI SDK** to interact with various AI providers. The SDK allows for flexible integrations, including custom tools and messages, making it easy to switch AI providers or add functionality without disrupting the core logic.

## Key Components

### System Messages

System messages allow control over the assistant's behavior. They can be either **provided by the client** or **enforced by the server** using a guard and a decorator. This ensures flexibility or strict control, depending on the desired use case.

-   **Client-Provided**: By default, clients can supply their own system message in the `messages` array.
-   **Server-Enforced**: By using the `EnforceServerSystemMessageGuard` and the `SystemMessage` decorator, we can block client-supplied system messages and enforce a system message from the server.

#### Example:

-   **Without Guard (Client-Provided System Message)**:

    ```json
    {
        "messages": [
            {
                "role": "system",
                "content": "Pretend you are a tiger 🐯."
            },
            {
                "role": "user",
                "content": "Make a joke"
            }
        ]
    }
    ```

-   **With Guard (Server-Enforced System Message)**:

    If the `EnforceServerSystemMessageGuard` is applied with a decorator like this:

    ```typescript
    @Controller("gen-ai")
    export class AIController {
        private readonly logger = new Logger(AIController.name)

        constructor(
            @Inject(GEN_AI_SERVICE_TOKEN)
            private readonly genAIService: IGenAI<AITools>
        ) {}

        @Post("generate-text")
        @UseGuards(EnforceServerSystemMessageGuard)
        @SystemMessage("Pretend you are a cow 🐮.")
        @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
        async generateText(
            @Body() createAICustomPromptDto: CreateAICustomPromptDto,
            @Req() req: { body: AIRequestBody }
        ): Promise<string> {
            // Controller logic
        }
    }
    ```

    The client's system message will be ignored or overridden, and the server-enforced message will be used:

    ```json
    {
        "messages": [
            {
                "role": "system",
                "content": "Pretend you are a cow 🐮."
            },
            {
                "role": "user",
                "content": "Make a joke"
            }
        ]
    }
    ```

This approach allows either flexibility for client customization or strict enforcement of server behavior.

### Tools Integration

The module also supports adding custom tools, which can be used to extend AI functionality. For example, a weather tool can be defined and called dynamically during the AI response generation process.

#### Example Tool: `getWeatherTool`

-   **Description**: Fetches current weather for a given location based on latitude and longitude.
-   **Schema**: Tools are defined using a schema (e.g., `zod`) to ensure proper validation of input parameters.

```typescript
export const getWeatherTool: CoreTool<typeof getWeatherSchema, string> = {
    description: "Fetches the current weather for a given location.",
    parameters: getWeatherSchema,
    async execute({ latitude, longitude }: GetWeatherArgs): Promise<string> {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        )
        const weatherData = await response.json()
        return JSON.stringify(weatherData)
    }
}
```

### Dynamic AI Providers

By using Vercel's AI SDK, the module allows dynamic switching of AI providers while keeping the core functionality intact. This makes it easy to adapt to different providers without significant changes.

## Module Structure

```bash
gen-ai
│   ├── functions
│   │   ├── function-definitions
│   │   ├── function-handlers
│   │   └── interface
```

## Interceptors

Interceptors are useful when you want to modify or transform the response before sending it back to the client. For instance, if you're integrating with multiple AI providers, you may need to transform the AI response to match the format required by a specific provider. This ensures that the client doesn't need to handle different formats themselves.

Nest Interceptors run after the response has left the Controller.

#### Usage

To add an interceptor to a controller:

```typescript
@Controller("gen-ai")
@UseInterceptors(OpenAIMessageInterceptor)
export class OpenAIController {
    // Controller logic
}
```

#### Example Use Case

An interceptor can transform raw AI responses (e.g., normalizing message formats or converting tool results) to match what an AI provider expects, ensuring consistency in what the client receives.

```typescript
@Injectable()
export class OpenAIMessageInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(data => {
                // Transform the response for a specific AI provider
                return data
            })
        )
    }
}
```

---

[← Back to Main Documentation](../README.md)
