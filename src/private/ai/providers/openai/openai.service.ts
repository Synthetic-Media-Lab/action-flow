import { Injectable, Logger } from "@nestjs/common"
import { Result, Ok, Err } from "pratica"
import { AIError } from "../../error/ai.error"
import OpenAI from "openai"
import { ConfigService } from "@nestjs/config"
import { IAI } from "../../interface/IAI"

@Injectable()
export class OpenAIService implements IAI {
    private readonly openai: OpenAI
    private readonly logger = new Logger(OpenAIService.name)

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>("OPENAI_API_KEY")

        if (!apiKey) {
            this.logger.error("OpenAI API key is missing in the configuration")
            throw new Error("OpenAI API key is missing")
        }

        this.openai = new OpenAI({
            apiKey
        })
    }

    public async generateText(
        prompt: string
    ): Promise<Result<string, AIError>> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt }
                ]
            })

            const message = completion.choices[0]?.message?.content || ""
            return Ok(message)
        } catch (error) {
            this.logger.error(`Failed to generate text: ${error.message}`)
            return Err(new AIError("Failed to generate text using OpenAI"))
        }
    }
}
